import util from "util";
import request from "request";

const CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

const rulesURL = new URL(
  "https://api.twitter.com/labs/1/tweets/stream/filter/rules"
);

const bearerTokenURL = new URL("https://api.twitter.com/oauth2/token");

const post = util.promisify(request.post);
const get = util.promisify(request.get);

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

class RulesController {
  async getRules(req, res) {
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
        throw new Error(response);
      }
      res.send(response);
    } catch (e) {
      res.send(e);
    }
  }

  async changeRules(req, res) {
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
  }
}

const rulesController = new RulesController();
export default rulesController;
