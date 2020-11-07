"use strict";
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");

module.exports.validate = async (event, context) => {
  const authorizerToken = event.authorizationToken;
  const authorizerArr = authorizerToken.split(" ");
  const token = authorizerArr[1];

  if (
    authorizerArr.length !== 2 ||
    authorizerArr[0] !== "Bearer" ||
    authorizerArr[1].length === 0
  ) {
    return generatePolicy("undefined", "Deny", event.methodArn);
  }

  let decodedJwt = jwt.verify(token, process.env.JWT_SECRET);

  const queryUserParams = {
    TableName: process.env.DYNAMODB_USER_TABLE,
    KeyConditionExpression: "#id = :id",
    ExpressionAttributeNames: {
      "#id": "id",
    },
    ExpressionAttributeValues: {
      ":id": decodedJwt.id,
    },
  };

  let userResult = {};
  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    userResult = await dynamodb.query(queryUserParams).promise();
  } catch (queryError) {
    console.log("There was an error attempting to retrieve the user.");
    console.log("queryError", queryError);
    console.log("queryUserParams", queryUserParams);
    return new Error("There was an error retrieving the user");
  }

  if (
    typeof decodedJwt.id !== "undefined" &&
    typeof userResult.Items !== "undefined" &&
    userResult.Items.length === 1
  ) {
    return generatePolicy(decodedJwt.id, "Allow", event.methodArn);
  }
  generatePolicy("undefined", "Deny", event.methodArn);
};

// Help function to generate an IAM policy
const generatePolicy = function (principalId, effect, resource) {
  let authResponse = {};

  authResponse.principalId = principalId;
  if (effect && resource) {
    let policyDocument = {};
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    let statementOne = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }

  return authResponse;
};
