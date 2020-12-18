"use strict";
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
module.exports.handler = async (event, context) => {
  console.log(event);

  const authorizerToken = event.headers.Authorization;
  const authorizerArr = authorizerToken.split(" ");
  const token = authorizerArr[1];
  let decodedJwt = jwt.verify(token, process.env.JWT_SECRET);
  // need to get the user and check password
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const getAdminParams = {
    TableName: process.env.DYNAMODB_ADMIN_TABLE,
    Key: {
      pk: decodedJwt.pk,
    },
  };
  let adminResult = {};
  try {
    adminResult = await dynamodb.get(getAdminParams).promise();
  } catch (error) {
    return new Error(error);
  }
  if (adminResult.Item === undefined) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Authorization",
      },
      body: "Your user is not an admin!",
    };
  }

  const params = {
    TableName: process.env.DYNAMODB_ORDER_TABLE,
    // FilterExpression: "#status = :status",
    // ExpressionAttributeNames: {
    //   "#status": "status"
    // },
    // ExpressionAttributeValues: {
    //   ":status": 'paid'
    // }
  };

  let scanResults = [];
  let items;
  do {
    items = await dynamodb.scan(params).promise();
    items.Items.forEach((item) => scanResults.push(item));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey != "undefined");
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Authorization",
    },
    body: JSON.stringify(scanResults),
  };
};
