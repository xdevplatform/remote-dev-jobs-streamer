const express = require("express");
const bodyParser = require("body-parser");
const util = require("util");
const request = require("request");
const path = require("path");
const socketIo = require("socket.io");
const http = require("http");

const app = express();
const port = process.env.PORT || 5000;
const post = util.promisify(request.post);
const get = util.promisify(request.get);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = socketIo(server);

const CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

let timeout = 0;

const bearerTokenURL = new URL("https://api.twitter.com/oauth2/token");

const streamURL = new URL(
  "https://api.twitter.com/labs/1/tweets/stream/filter?format=detailed&expansions=author_id"
);

const rulesURL = new URL(
  "https://api.twitter.com/labs/1/tweets/stream/filter/rules"
);

const errorMessage = {
  title: "Please Wait",
  detail: "Waiting for new jobs to be posted..."
};

const sleep = async delay => {
  return new Promise(resolve => setTimeout(() => resolve(true), delay));
};

async function bearerToken(auth) {
  const requestConfig = {
    url: bearerTokenURL,
    auth: {
      user: CONSUMER_KEY,
      pass: CONSUMER_SECRET
    },
    form: {
      grant_type: "client_credentials"
    }
  };

  const response = await post(requestConfig);
  return JSON.parse(response.body).access_token;
}

app.get("/rules", async (req, res) => {
  const token = await bearerToken({ CONSUMER_KEY, CONSUMER_SECRET });
  const requestConfig = {
    url: rulesURL,
    auth: {
      bearer: token
    },
    json: true
  };

  try {
    const response = await get(requestConfig);

    if (response.statusCode !== 200) {
      throw new Error(response.body.error.message);
    }

    res.send(response);
  } catch (e) {
    res.send(e);
  }
});

app.post("/rules", async (req, res) => {
  const token = await bearerToken({ CONSUMER_KEY, CONSUMER_SECRET });
  const requestConfig = {
    url: rulesURL,
    auth: {
      bearer: token
    },
    json: req.body
  };

  try {
    const response = await post(requestConfig);

    if (response.statusCode === 200 || response.statusCode === 201) {
      res.send(response);
    } else {
      throw new Error(response);
    }
  } catch (e) {
    res.send(e);
  }
});

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
