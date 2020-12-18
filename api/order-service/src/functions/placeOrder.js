"use strict";
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const generator = require("generate-password");
const http = require("https");
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
  const notes = body.notes;
  const getOwnerParams = {
    TableName: process.env.DYNAMODB_USER_TABLE,
    Key: {
      pk: owner,
    },
  };

  let ownerResponse;
  try {
    ownerResponse = await dynamodb.get(getOwnerParams).promise();
  } catch (error) {
    console.error("Couldn't get the owner's user info.");
    return new Error("There was a problem getting the owners user info.");
  }
  let orderId;
  if (ownerResponse.Item !== undefined) {
    orderId = `${ownerResponse.Item.apartment}-${generator.generate({
      length: 4,
      numbers: true,
      uppercase: true,
    })}`;
  } else {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Authorization",
      },
      body: JSON.stringify({
        success: false,
        message: "Could not find the owner of the shop for this order.",
      }),
    };
  }

  const customerId = decodedJwt.phone;
  const getCustomerParams = {
    TableName: process.env.DYNAMODB_USER_TABLE,
    Key: {
      pk: customerId,
    },
  };

  let customerResponse;
  try {
    customerResponse = await dynamodb.get(getCustomerParams).promise();
  } catch (error) {
    console.error("Couldn't get the customer's user info.");
    return new Error("There was a problem getting the customer user info.");
  }
  let customerName;
  if (customerResponse.Item !== undefined) {
    customerName = customerResponse.Item.name;
  } else {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Authorization",
      },
      body: JSON.stringify({
        success: false,
        message: "Could not find the customer of the order.",
      }),
    };
  }

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
  const { password, ...customer } = customerResponse.Item;
  const newOrderParams = {
    TableName: process.env.DYNAMODB_ORDER_TABLE,
    Item: {
      orderId: orderId,
      shopId: shopId,
      owner: owner,
      customerId: customerId,
      customer: customer,
      products: products,
      delivery: delivery,
      date: date,
      updated: date,
      total: total,
      status: "pending",
      notes: notes,
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
    const newRemaining = dbProductFound.product.remaining - product.quantity;
    let updateExpression = "set #remaining = :remaining";
    let expressionAttributeNames = {
      "#remaining": "remaining",
    };
    let expressionAttributeValues = {
      ":remaining": newRemaining,
    };
    if (newRemaining == 0) {
      updateExpression += ", #status = :status";
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = "sold out";
    }
    const productParams = {
      TableName: process.env.DYNAMODB_PRODUCT_TABLE,
      Key: {
        id: product.id,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
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

    const orderPage = `${event.headers.origin}/orders/${orderId}`;
    const message = `Yay! ${customerName} has placed an order from your shop. Please click here ${orderPage} to check`;
    const requestBody = {
      phone: owner,
      message: message,
    };
    const options = {
      host: "sawit.wablas.com",
      port: 443,
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.WABLAS_TOKEN,
      },
      path: "/api/send-message",
      method: "POST",
    };

    console.log("options:", options);
    let wablasPromise = new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        res.setEncoding("utf8");
        let responseBody = "";
        res.on("data", (chunk) => {
          responseBody += chunk;
        });
        res.on("end", () => {
          resolve(JSON.parse(responseBody));
        });
        res.on("error", (err) => {
          reject(err);
        });
      });

      req.write(JSON.stringify(requestBody));
      req.end();
    });
    console.log("Sending wablas request...");
    const wabResponse = await wablasPromise;
    console.log(wabResponse);
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
