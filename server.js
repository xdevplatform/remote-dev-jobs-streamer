const express = require("express");
const bodyParser = require("body-parser");
const util = require("util");
const request = require("request");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;
const post = util.promisify(request.post);
const get = util.promisify(request.get);
const https = require("https");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

const bearerTokenURL = new URL("https://api.twitter.com/oauth2/token");

const streamURL = new URL(
  "https://api.twitter.com/labs/1/tweets/stream/filter?format=detailed&expansions=author_id"
);

const rulesURL = new URL(
  "https://api.twitter.com/labs/1/tweets/stream/filter/rules"
);

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

app.get("/api/labs/1/tweets/stream/filter/rules", async (req, res) => {
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
      return;
    }

    res.send(response);
  } catch (e) {
    console.error(`Could not get rules. An error occurred: ${e}`);
    process.exit(-1);
  }
});

app.post("/api/labs/1/tweets/stream/filter/rules", async (req, res) => {
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
      throw new Error(response.body.error.message);
      return;
    }
  } catch (e) {
    res.statusCode(response.statusCode).send(response);
  }
});

app.get("/api/stream/filter", async (req, res) => {
  const token = await bearerToken({ CONSUMER_KEY, CONSUMER_SECRET });
  const config = {
    url: streamURL,
    auth: {
      bearer: token
    },
    timeout: 20000
  };

  const stream = request.get(config);

  stream
    .on("data", data => {
      try {
        const json = JSON.parse(data);
        console.log(json);
        res.write(data);
      } catch (e) {}
    })
    .on("error", error => {
      console.log("error =>", error);
      if (error.code === "ESOCKETTIMEDOUT") {
        res.send({ error: "timeout" });
      }
    });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));

  app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
