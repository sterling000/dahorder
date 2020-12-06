"use strict";
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
module.exports.handler = async (event, context) => {
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

  const body = JSON.parse(event.body);
  const { shopId, date, isConfirmed } = body;

  let status;
  if (isConfirmed) {
    status = "confirmed";
  } else {
    status = "pending";
  }
  const updateParams = {
    TableName: process.env.DYNAMODB_ORDER_TABLE,
    Key: {
      shopId: shopId,
      date: date,
    },
    UpdateExpression: "set #status = :status, #updated = :updated",
    ExpressionAttributeNames: {
      "#status": "status",
      "#updated": "updated",
    },
    ExpressionAttributeValues: {
      ":status": status,
      ":updated": new Date().toISOString(),
    },
  };

  try {
    await dynamodb.update(updateParams).promise();
  } catch (error) {
    return error;
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Authorization",
    },
    body: "Status Updated.",
  };
};
