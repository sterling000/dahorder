"use strict";
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

module.exports.handler = async (event) => {
  console.log(event);
  const dynamodb = new AWS.DynamoDB.DocumentClient();

  const authorizerToken = event.headers.Authorization;
  const authorizerArr = authorizerToken.split(" ");
  const token = authorizerArr[1];
  let decodedJwt = jwt.verify(token, process.env.JWT_SECRET);

  const body = JSON.parse(event.body);

  const orderId = uuidv4();
  const shopId = body.shop;
  const owner = body.owner;
  const customerId = decodedJwt.phone;

  const products = [];
  const productPromises = [];
  body.products.forEach(async (product) => {
    const productParams = {
      TableName: process.env.DYNAMODB_PRODUCT_TABLE,
      Key: {
        id: product.id,
      },
    };
    console.log("productParams", productParams);
    productPromises.push(dynamodb.get(productParams).promise());
  });
  await Promise.all(productPromises).then((result) => {
    result.forEach((response) => {
      console.log("Product Get Response:", response);
      const requestedProduct = body.products.find(
        (product) => product.id === response.Item.id
      );
      products.push({
        product: response.Item,
        subtotal: requestedProduct.quantity * response.Item.price,
      });
    });
  });

  const subtotals = products.map((productSubtotal) => productSubtotal.subtotal);
  const total = subtotals.reduce((acc, cur) => acc + cur);
  console.log("Total: ", total);
  const delivery = body.delivery;
  const date = new Date().toISOString();
  const newOrderParams = {
    TableName: process.env.DYNAMODB_ORDER_TABLE,
    Item: {
      orderId: orderId,
      shopId: shopId,
      owner: owner,
      customerId: customerId,
      products: products,
      delivery: delivery,
      date: date,
      total: total,
      status: "pending",
    },
    ConditionExpression: "attribute_not_exists(orderId)",
  };

  try {
    console.log(newOrderParams);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const putResult = await dynamodb.put(newOrderParams).promise();
    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Authorization",
      },
      body: JSON.stringify(putResult),
    };
  } catch (putError) {
    console.log("There was an error putting a new order");
    console.log("putError", putError);
    console.log("newOrderParams", newOrderParams);
    return new Error("There was an error putting the new order");
  }
};
