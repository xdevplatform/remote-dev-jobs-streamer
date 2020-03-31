import router from "./routes/index.js";
import express from "express";
import bodyParser from "body-parser";
import util from "util";
import request from "request";
import path from "path";
import socketIo from "socket.io";
import http from "http";
import models from "./models";

const CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
const bearerTokenURL = new URL("https://api.twitter.com/oauth2/token");

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

const title = json => {
  const { entities } = json.data;

  if (entities && entities.urls && entities.urls[0] && entities.urls[0].title) {
    return entities.urls[0].title;
  } else {
    return json.data.text.substring(0, 32) + "...";
  }
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

const addJob = json => {
  const { name = "", username = "" } = json.includes.users[0];
  const job = {
    description: json.data.text,
    company: name,
    title: title(json),
    username: username,
    tweet_id: json.data.id,
    tweet_createdAt: json.data.created_at
  };
  models.Job.create(job).then(job => {
    console.log("Job created =>", job);
  });
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
        console.log("data =>", JSON.parse(data));
        const json = JSON.parse(data);

        if (json.connection_issue) {
          socket.emit("error", json);
          reconnect(stream, socket, token);
        } else {
          addJob(json);
        }
      } catch (e) {
        console.log("e =>", e);
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
    console.log("here");
    const stream = streamTweets(io, token);
  } catch (e) {
    console.log("e =>", e);
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));

  app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

server.listen(port, () => console.log(`Listening on port ${port}`));
