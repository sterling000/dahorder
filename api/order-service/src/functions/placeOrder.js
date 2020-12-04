"use strict";
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const generator = require("generate-password");
module.exports.handler = async (event) => {
  console.log(event);
  const dynamodb = new AWS.DynamoDB.DocumentClient();

  const authorizerToken = event.headers.Authorization;
  const authorizerArr = authorizerToken.split(" ");
  const token = authorizerArr[1];
  let decodedJwt = jwt.verify(token, process.env.JWT_SECRET);

  const body = JSON.parse(event.body);

  const shopId = body.shop;
  const owner = body.owner;
  const orderId = `${owner.substring(2)}-${generator.generate({
    length: 8,
    numbers: true,
    uppercase: true,
  })}`;

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
  let orderTooMany = [];
  await Promise.all(productPromises).then((result) => {
    result.forEach((response) => {
      console.log("Product Get Response:", response);
      const requestedProduct = body.products.find(
        (product) => product.id === response.Item.id
      );
      console.log("requestedProduct", requestedProduct);
      console.log("responseItem", response.Item);
      if (requestedProduct.quantity > response.Item.remaining) {
        orderTooMany.push(requestedProduct);
      } else {
        products.push({
          product: response.Item,
          quantity: requestedProduct.quantity,
          subtotal: requestedProduct.quantity * response.Item.price,
        });
      }
    });
  });

  if (orderTooMany.length > 0) {
    return {
      statusCode: 203,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Authorization",
      },
      body: JSON.stringify({
        success: false,
        message: "There are not enough products to fulfil your order.",
      }),
    };
  }
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
      updated: date,
      total: total,
      status: "pending",
    },
    ConditionExpression: "attribute_not_exists(orderId)",
  };
  console.log("products", JSON.stringify(products));
  const updatePromises = [];
  body.products.forEach((product) => {
    const dbProductFound = products.find(
      (dbProduct) => dbProduct.product.id == product.id
    );
    console.log("product found: ", product.id, dbProductFound);

    const productParams = {
      TableName: process.env.DYNAMODB_PRODUCT_TABLE,
      Key: {
        id: product.id,
      },
      UpdateExpression: "set #remaining = :remaining",
      ExpressionAttributeValues: {
        ":remaining": dbProductFound.product.remaining - product.quantity,
      },
      ExpressionAttributeNames: {
        "#remaining": "remaining",
      },
      ReturnValues: "UPDATED_NEW",
    };
    console.log("productParams", productParams);
    updatePromises.push(dynamodb.update(productParams).promise());
  });
  try {
    await Promise.all(updatePromises);
  } catch (error) {
    console.log(
      "There was an error trying to update the remaining amount for a product."
    );
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Authorization",
      },
      body:
        "There was a problem updating the remaining quantity, please contact support.",
    };
  }

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
