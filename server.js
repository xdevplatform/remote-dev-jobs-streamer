import router from "./routes/index.js";
import express from "express";
import bodyParser from "body-parser";
import util from "util";
import request from "request";
import path from "path";
import socketIo from "socket.io";
import http from "http";

// const express = require("express");
// const bodyParser = require("body-parser");
// const util = require("util");
// const request = require("request");
// const path = require("path");
// const socketIo = require("socket.io");
// const http = require("http");

const app = express();
const port = process.env.PORT || 5000;
const post = util.promisify(request.post);
const get = util.promisify(request.get);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);

const server = http.createServer(app);
const io = socketIo(server);

let timeout = 0;

const streamURL = new URL(
  "https://api.twitter.com/labs/1/tweets/stream/filter?format=detailed&expansions=author_id"
);

const errorMessage = {
  title: "Please Wait",
  detail: "Waiting for new jobs to be posted..."
};

const sleep = async delay => {
  return new Promise(resolve => setTimeout(() => resolve(true), delay));
};

const streamTweets = (socket, token) => {
  const config = {
    url: streamURL,
    auth: {
      bearer: token
    },
    timeout: 31000
  };

  const stream = request.get(config);

  stream
    .on("data", data => {
      try {
        const json = JSON.parse(data);
        if (json.connection_issue) {
          socket.emit("error", json);
          reconnect(stream, socket, token);
        } else {
          socket.emit("tweet", json);
        }
      } catch (e) {
        socket.emit("heartbeat");
      }
    })
    .on("error", error => {
      // Connection timed out
      socket.emit("error", errorMessage);
      reconnect(stream, socket, token);
    });
};

const reconnect = async (stream, socket, token) => {
  timeout++;
  stream.abort();
  await sleep(2 ** timeout * 1000);
  streamTweets(socket, token);
};

io.on("connection", async socket => {
  try {
    const token = await bearerToken({ CONSUMER_KEY, CONSUMER_SECRET });
    io.emit("connect", "Client connected");
    const stream = streamTweets(io, token);
  } catch (e) {}
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));

  app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

server.listen(port, () => console.log(`Listening on port ${port}`));
