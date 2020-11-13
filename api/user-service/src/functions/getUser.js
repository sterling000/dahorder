"use strict";
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");

module.exports.handler = async (event, context) => {
  const authorizerToken = event.headers.Authorization;
  const authorizerArr = authorizerToken.split(" ");
  const token = authorizerArr[1];
  let decodedJwt = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decodedJwt);
  const queryUserParams = {
    TableName: process.env.DYNAMODB_USER_TABLE,
    KeyConditionExpression: "#pk = :pk",
    ExpressionAttributeNames: {
      "#pk": "pk",
    },
    ExpressionAttributeValues: {
      ":pk": `${decodedJwt.phone}`,
    },
  };

  let shopsResult = {};
  try {
    console.log(queryUserParams);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    shopsResult = await dynamodb.query(queryUserParams).promise();
  } catch (queryError) {
    console.log("There was an error attempting to retrieve the user.");
    console.log("queryError", queryError);
    console.log("queryUserParams", queryUserParams);
    return new Error("There was an error retrieving the user.");
  }
  if (shopsResult.Items.length === 0) {
    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Authorization",
      },
      body: "Could not find a user with those params.",
    };
  }
  const { password, ...noPassword } = shopsResult.Items[0];
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Authorization",
    },
    body: JSON.stringify(noPassword),
  };
};
