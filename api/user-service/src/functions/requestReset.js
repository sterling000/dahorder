"use strict";
const jwt = require("jsonwebtoken");
const http = require("https");
module.exports.handler = async (event, context) => {
  const { phone, client } = event.queryStringParameters;

  const token = jwt.sign(
    {
      phone: `+6${phone}`,
    },
    process.env.JWT_SECRET
  );

  const resetLink = `https://${client}/reset/${token}`;

  const message = `${event.headers.origin} is requesting a new password for the account with your phone number. If this wasn't you, you can ignore this message. Otherwise, tap this link to reset your password. ${resetLink}`;
  const requestBody = {
    phone: `6${phone}`,
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
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Authorization",
    },
  };
};
