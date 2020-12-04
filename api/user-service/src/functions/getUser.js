"use strict";
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");

const getMyUserParams = (event) => {
  const authorizerToken = event.headers.Authorization;
  const authorizerArr = authorizerToken.split(" ");
  const token = authorizerArr[1];
  let decodedJwt = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decodedJwt);
  return {
    TableName: process.env.DYNAMODB_USER_TABLE,
    KeyConditionExpression: "#pk = :pk",
    ExpressionAttributeNames: {
      "#pk": "pk",
    },
    ExpressionAttributeValues: {
      ":pk": `${decodedJwt.phone}`,
    },
  };
};

const getAnyUserParams = (event) => {
  return {
    TableName: process.env.DYNAMODB_USER_TABLE,
    KeyConditionExpression: "#pk = :pk",
    ExpressionAttributeNames: {
      "#pk": "pk",
    },
    ExpressionAttributeValues: {
      ":pk": `${event.queryStringParameters.user}`,
    },
  };
};

module.exports.handler = async (event, context) => {
  let queryUserParams;
  if (event.headers.Authorization !== undefined) {
    queryUserParams = getMyUserParams(event);
  } else {
    queryUserParams = getAnyUserParams(event);
  }

  let userResult = {};
  try {
    console.log(queryUserParams);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    userResult = await dynamodb.query(queryUserParams).promise();
  } catch (queryError) {
    console.log("There was an error attempting to retrieve the user.");
    console.log("queryError", queryError);
    console.log("queryUserParams", queryUserParams);
    return new Error("There was an error retrieving the user.");
  }
  if (userResult.Items.length === 0) {
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
  const { password, ...noPassword } = userResult.Items[0];
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
