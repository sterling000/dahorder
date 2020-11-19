"use strict";
const AWS = require("aws-sdk");

module.exports.handler = async (event, context) => {
  console.log(event);
  const body = JSON.parse(event.body);
  console.log("body", body);
  let UpdateExpression = "set ";
  let ExpressionAttributeValues = {};
  let ExpressionAttributeNames = {};
  let keys = Object.keys(body);
  let filter = keys.filter((key) => key != "pk");
  let keysLength = filter.length;
  console.log("keysLength", keysLength);
  for (let i = 0; i < keysLength; i++) {
    if (i > 0) {
      UpdateExpression += ", ";
    }
    UpdateExpression += `#${filter[i]} = :${filter[i]}`;
    ExpressionAttributeValues[`:${filter[i]}`] = `${body[filter[i]]}`;
    ExpressionAttributeNames[`#${filter[i]}`] = `${filter[i]}`;
  }
  const updateParams = {
    TableName: process.env.DYNAMODB_USER_TABLE,
    Key: {
      pk: body.pk,
    },
    UpdateExpression: UpdateExpression,
    ExpressionAttributeValues: ExpressionAttributeValues,
    ExpressionAttributeNames: ExpressionAttributeNames,
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
