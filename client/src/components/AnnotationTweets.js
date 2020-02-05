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

  const fetchTweets = () => {
    console.log("here");
    const config = {
      url: "http://localhost:3000/api/stream/filter",
      timeout: 20000
    };

    const stream = request.get(config);

    stream
      .on("data", data => {
        try {
          console.log("data =>", JSON.parse(data));
          data = JSON.parse(data);
          if (data.data) {
            dispatch({ type: "add_tweet", payload: data.data });
          }
        } catch (e) {}
      })
      .on("error", error => {
        if ((error.code = "ETIMEDOUT")) {
          console.log("TIMEOUT");
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
