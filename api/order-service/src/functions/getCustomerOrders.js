"use strict";
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
module.exports.handler = async (event, context) => {
  console.log(event);
  const authorizerToken = event.headers.Authorization;
  const authorizerArr = authorizerToken.split(" ");
  const token = authorizerArr[1];
  let decodedJwt = jwt.verify(token, process.env.JWT_SECRET);

  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const queryParams = {
    TableName: process.env.DYNAMODB_ORDER_TABLE,
    IndexName: "customerIndex",
    ExpressionAttributeNames: {
      "#customerId": "customerId",
    },
    ExpressionAttributeValues: {
      ":customerId": decodedJwt.phone,
    },
    KeyConditionExpression: "#customerId = :customerId",
  };

  let queryResult = {};
  try {
    console.log(queryParams);
    queryResult = await dynamodb.query(queryParams).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Authorization",
      },
      body: JSON.stringify(queryResult.Items),
    };
  } catch (err) {
    console.error("There was an error attempting to query the orders.", err);
    console.log("queryParams", queryParams);
    return new Error(err);
  }
};
