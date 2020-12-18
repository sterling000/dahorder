"use strict";
const AWS = require("aws-sdk");

module.exports.handler = async (event) => {
  console.log(event);
  const body = JSON.parse(event.body);

  let UpdateExpression = "set ";
  let ExpressionAttributeValues = {};
  let ExpressionAttributeNames = {};
  const filtered = Object.keys(body).filter((key) => key !== "id");
  let keysLength = filtered.length;
  for (let i = 0; i < keysLength; i++) {
    console.log("typeof:", typeof body[filtered[i]], body[filtered[i]]);
    if (i > 0) {
      UpdateExpression += ", ";
    }
    UpdateExpression += `#${filtered[i]} = :${filtered[i]}`;
    ExpressionAttributeValues[`:${filtered[i]}`] = body[filtered[i]];
    ExpressionAttributeNames[`#${filtered[i]}`] = `${filtered[i]}`;
  }
  const updateParams = {
    TableName: process.env.DYNAMODB_PRODUCT_TABLE,
    Key: {
      id: body.id,
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
    console.log("There was an error attempting to update the product.");
    console.log("putError", putError);
    console.log("putParams", updateParams);
    return new Error("There was an error updating the product.");
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
