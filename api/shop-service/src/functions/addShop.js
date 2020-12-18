"use strict";
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const { v5: uuidv5 } = require("uuid");

module.exports.handler = async (event) => {
  console.log(event);
  const authorizerToken = event.headers.Authorization;
  const authorizerArr = authorizerToken.split(" ");
  const token = authorizerArr[1];
  let decodedJwt = jwt.verify(token, process.env.JWT_SECRET);

  const body = JSON.parse(event.body);
  const owner = decodedJwt.phone;
  const { name, condo, description, thumbnail, category } = body;

  const id = uuidv5(
    `${process.env.DYNAMODB_SHOP_TABLE}-${owner}-${name}`,
    uuidv5.URL
  );

  const newShopParams = {
    TableName: process.env.DYNAMODB_SHOP_TABLE,
    Item: {
      pk: owner,
      id: id,
      name: name,
      condo: condo,
      description: description,
      thumbnail: thumbnail,
      category: category,
    },
    ConditionExpression: "attribute_not_exists(pk)",
  };

  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const putResult = await dynamodb.put(newShopParams).promise();
    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Authorization",
      },
    };
  } catch (putError) {
    console.log("There was an error putting a new shop");
    console.log("putError", putError);
    console.log("newShopParams", newShopParams);
    return new Error("There was an error putting the new shop");
  }
};
