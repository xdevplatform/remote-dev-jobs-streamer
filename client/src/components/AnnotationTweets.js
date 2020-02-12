import React, { useEffect, useReducer } from "react";
import request from "request";

import Tweet from "./Tweet";

const reducer = (state, action) => {
  switch (action.type) {
    case "add_tweet":
      return [action.payload, ...state];
    default:
      return state;
  }
};

const AnnotationTweets = () => {
  const [state, dispatch] = useReducer(reducer, []);
  const tweets = state;

  const sleep = async delay => {
    return new Promise(resolve => setTimeout(() => resolve(true), delay));
  };

  const fetchTweets = () => {
    const config = {
      url: "http://localhost:3000/api/stream/filter",
      timeout: 20000
    };

    const stream = request.get(config);

    stream.on("data", async data => {
      try {
        console.log("data =>", JSON.parse(data));
        data = JSON.parse(data);
        if (data.data) {
          dispatch({ type: "add_tweet", payload: data.data });
        } else {
          throw new Error(data.error);
        }
      } catch (e) {
        // Connection timedout
        stream.abort();
        await sleep(10000);
        fetchTweets();
      }
    });
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  return (
    <div className="ui segments">
      {tweets.map(tweet => (
        <Tweet key={tweet.id} data={tweet} />
      ))}
    </div>
  );
};

export default AnnotationTweets;
