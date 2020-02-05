import React from "react";
import "../stylesheets/Tweet.css";
import Moment from "react-moment";

const hashtags = data => {
  const { extended_tweet } = data;
  if (
    extended_tweet &&
    extended_tweet.entities &&
    extended_tweet.entities.hashtags
  ) {
    return extended_tweet.entities.hashtags.map(hashtag => (
      <span key={data.id + hashtag.text} className="ui small label">
        #{hashtag.text}
      </span>
    ));
  }
};

const annotations = data => {
  const { extended_tweet } = data;

  if (
    extended_tweet &&
    extended_tweet.entities &&
    extended_tweet.entities.annotations
  ) {
    return extended_tweet.entities.annotations.context.map(context => (
      <span className="annotations ui small teal basic label">
        {context.context_entity_name}
      </span>
    ));
  } else if (data.entities) {
    return data.entities.annotations.context.map(context => (
      <span className="annotations ui small teal basic label">
        {context.context_entity_name}
      </span>
    ));
  }
};

const title = data => {
  const { extended_tweet } = data;
  const { entities } = data;

  if (
    extended_tweet &&
    extended_tweet.entities &&
    extended_tweet.entities.urls[0] &&
    extended_tweet.entities.urls[0].unwound &&
    extended_tweet.entities.urls[0].unwound.title !== null
  ) {
    return extended_tweet.entities.urls[0].unwound.title;
  } else if (
    entities &&
    entities.urls[0] &&
    entities.urls[0].unwound &&
    entities.urls[0].unwound.title !== null
  ) {
    return entities.urls[0].unwound.title;
  } else {
    return data.text.substring(0, 32) + "...";
  }
};

const full_text = data => {
  const { extended_tweet } = data;

  if (extended_tweet && extended_tweet.full_text) {
    return extended_tweet.full_text;
  } else {
    return data.text;
  }
};

const ExtendedTweet = ({ data }) => {
  return (
    <div className="ui segment">
      <h4 className="ui header">
        {title(data)} <div className="sub header">{data.user.name}</div>
        <Moment
          className="sub header"
          parse="ddd MMM DD HH:mm:ss +HHmm YYYY"
          fromNow
        >
          {data.created_at}
        </Moment>
      </h4>

      <p>{full_text(data)}</p>
      {hashtags(data)}
      {annotations(data)}
    </div>
  );
};

export default ExtendedTweet;
