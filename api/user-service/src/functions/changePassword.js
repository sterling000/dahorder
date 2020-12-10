"use strict";
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
module.exports.handler = async (event, context) => {
  console.log(event);
  const authorizerToken = event.headers.Authorization;
  const authorizerArr = authorizerToken.split(" ");
  const token = authorizerArr[1];
  let decodedJwt = jwt.verify(token, process.env.JWT_SECRET);
  const body = JSON.parse(event.body);
  console.log("body", body);
  let UpdateExpression = "set password = :password";
  let ExpressionAttributeValues = {
    ":password": bcrypt.hashSync(body.newPassword, 10),
  };

  const updateParams = {
    TableName: process.env.DYNAMODB_USER_TABLE,
    Key: {
      pk: decodedJwt.phone,
    },
    UpdateExpression: UpdateExpression,
    ExpressionAttributeValues: ExpressionAttributeValues,
    ReturnValues: "UPDATED_NEW",
  };

  try {
    console.log(updateParams);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    await dynamodb.update(updateParams).promise();
  } catch (putError) {
    console.log("There was an error attempting to update the user.");
    console.log("putError", putError);
    console.log("putParams", updateParams);
    return new Error("There was an error updating the user.");
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Authorization",
    },
  };
};
