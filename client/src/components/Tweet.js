import React from "react";

const hashtags = data => {
  if (data.entities && data.entities.hashtags) {
    return data.entities.hashtags.map(hashtag => (
      <span key={hashtag.tag} className="ui label">
        #{hashtag.tag}
      </span>
    ));
  }
};

const title = data => {
  if (data.entities && data.entities.urls) {
    return data.entities.urls[0].title;
  }
};

const Tweet = ({ data }) => {
  return (
    <div className="ui segment">
      <h4 className="ui header">{title(data)}</h4>
      <p>{data.text}</p>
      {hashtags(data)}
    </div>
  );
};

export default Tweet;
