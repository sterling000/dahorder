"use strict";
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");

module.exports.handler = async (event, context) => {
  console.log(event);
  const authorizerToken = event.headers.Authorization;
  const authorizerArr = authorizerToken.split(" ");
  const token = authorizerArr[1];
  let decodedJwt = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decodedJwt);

  const id = event.queryStringParameters.id;
  const queryProductParams = {
    TableName: process.env.DYNAMODB_PRODUCT_TABLE,
    KeyConditionExpression: "#pk = :pk and #id = :id",
    ExpressionAttributeNames: {
      "#pk": "pk",
      "#id": "id",
    },
    ExpressionAttributeValues: {
      ":pk": `${decodedJwt.phone}`,
      ":id": `${id}`,
    },
  };

  let productResult = {};
  try {
    console.log(queryProductParams);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    productResult = await dynamodb.query(queryProductParams).promise();
  } catch (queryError) {
    console.log("There was an error attempting to retrieve the user's shops.");
    console.log("queryError", queryError);
    console.log("queryShopsParams", queryProductParams);
    return new Error("There was an error retrieving the user's shops.");
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Authorization",
    },
    body: JSON.stringify(productResult.Items),
  };
};
