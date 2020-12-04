"use strict";
const { AlexaForBusiness } = require("aws-sdk");
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
module.exports.handler = async (event, context) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const authorizerToken = event.headers.Authorization;
  const authorizerArr = authorizerToken.split(" ");
  const token = authorizerArr[1];
  let decodedJwt = jwt.verify(token, process.env.JWT_SECRET);

  const body = JSON.parse(event.body);
  const date = body.date;

  const updateParams = {
    TableName: process.env.DYNAMODB_ORDER_TABLE,
    Key: {
      shopId: body.shop,
      date: date,
    },
    UpdateExpression:
      "set #status = :status, #payment = :payment, #updated = :updated",
    ConditionExpression: "#customerId = :customerId",
    ExpressionAttributeNames: {
      "#status": "status",
      "#payment": "payment",
      "#customerId": "customerId",
      "#updated": "updated",
    },
    ExpressionAttributeValues: {
      ":status": "paid",
      ":payment": body.payment,
      ":customerId": decodedJwt.phone,
      ":updated": new Date().toISOString(),
    },
  };
  let updateResult = {};
  try {
    const updateResult = await dynamodb.update(updateParams).promise();
    console.log(updateResult);
  } catch (error) {
    console.log("updateParams", updateParams);
    console.error("Couldn't update the item.", error);
    return new Error(error);
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Authorization",
    },
    body: JSON.stringify(updateResult),
  };
};
