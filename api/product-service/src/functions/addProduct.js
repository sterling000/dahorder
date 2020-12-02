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
  const name = body.name;
  const id = uuidv5(
    `${process.env.DYNAMODB_PRODUCT_TABLE}-${owner}-${name}`,
    uuidv5.URL
  );
  const description = body.description;
  const thumbnail = body.thumbnail;
  const price = Number(body.price);
  const quantity = Number(body.quantity);
  const remaining = Number(body.remaining);
  const available = body.available;
  const delivery = body.delivery == 'true';
  const shop = body.shop;

  const newProductParams = {
    TableName: process.env.DYNAMODB_PRODUCT_TABLE,
    Item: {
      owner: owner,
      id: id,
      name: name,
      description: description,
      thumbnail: thumbnail,
      price: price,
      quantity: quantity,
      remaining: remaining,
      available: available,
      delivery: delivery,
      shop: shop,
    },
    ConditionExpression: "attribute_not_exists(id)",
  };

  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const putResult = await dynamodb.put(newProductParams).promise();
    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Authorization",
      },
    };
  } catch (putError) {
    console.log("There was an error putting a new product");
    console.log("putError", putError);
    console.log("newProductParams", newProductParams);
    return new Error("There was an error putting the new product");
  }
};
