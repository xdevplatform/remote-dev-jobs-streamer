import React, { useState, useEffect } from "react";
import axios from "axios";
import ExtendedTweet from "./ExtendedTweet";

const TweetList = () => {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await axios.get("/api/tweets/search/30day");
      setTweets(response.data.body.results);
      console.log(response.data.body.results);
    })();
  }, []);

  return (
    <div className="twelve wide stretched column">
      <div className="ui segments">
        {tweets.map(tweet => (
          <ExtendedTweet key={tweet.id} data={tweet} />
        ))}
      </div>
    </div>
  );
};

export default TweetList;
