import React from "react";
import Moment from "react-moment";
import "../stylesheets/Job.css";

const Job = ({ json }) => {
  const { created_at, id_str } = json.data;

  const hashtags = () => {
    if (json.data.entities && json.data.entities.hashtags) {
      return json.data.entities.hashtags.map(hashtag => (
        <span key={hashtag.tag} className="ui label">
          #{hashtag.tag}
        </span>
      ));
    }
  };

  const title = () => {
    const { entities } = json.data;

    if (
      entities &&
      entities.urls &&
      entities.urls[0] &&
      entities.urls[0].title
    ) {
      return entities.urls[0].title;
    } else {
      return json.data.text.substring(0, 32) + "...";
    }
  };

  const annotations = () => {
    if (json.data.context_annotations) {
      return json.data.context_annotations.map(context => (
        <span className="ui small teal basic label">{context.entity.name}</span>
      ));
    }
  };

  const userName = () => {
    if (json.includes) {
      return json.includes.users[0].name;
    }
  };

  return (
    <a href={`http://www.twitter.com/${userName()}/${id_str}`} target="_blank">
      <div className="ui segment job">
        <h4 className="ui header">
          {title()}
          <div className="sub header">{userName()}</div>
          <Moment
            className="sub header"
            parse="YYYY-MM-DDTHH:mm:ss.ZZZZ"
            fromNow
          >
            {created_at}
          </Moment>
        </h4>

        <p>{json.data.text}</p>
        {hashtags()}
        {annotations()}
      </div>
    </a>
  );
};

export default Job;
