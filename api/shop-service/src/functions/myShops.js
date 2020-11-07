"use strict";
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");

module.exports.handler = async (event, context) => {
  const authorizerToken = event.headers.Authorization;
  const authorizerArr = authorizerToken.split(" ");
  const token = authorizerArr[1];
  let decodedJwt = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decodedJwt);
  const queryShopsParams = {
    TableName: process.env.DYNAMODB_SHOP_TABLE,
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
    console.log(queryShopsParams);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    shopsResult = await dynamodb.query(queryShopsParams).promise();
  } catch (queryError) {
    console.log("There was an error attempting to retrieve the user's shops.");
    console.log("queryError", queryError);
    console.log("queryShopsParams", queryShopsParams);
    return new Error("There was an error retrieving the user's shops.");
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Authorization",
    },
    body: JSON.stringify({
      shops: shopsResult.Items,
    }),
  };
};
