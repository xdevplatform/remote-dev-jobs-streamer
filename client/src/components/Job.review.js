import React from "react";
import Moment from "react-moment";
import "../stylesheets/Job.css";

const Job = ({ json }) => {
  const { created_at, id } = json.data;
  const { name = "", username = "" } = json.includes.users[0];

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
        <span key={context.entity.id} className="ui small teal basic label">
          {context.entity.name}
        </span>
      ));
    }
  };

  return (
    <a
      href={`http://www.twitter.com/${username}/status/${id}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="ui segment job">
        <h4 className="ui header">
          {title()}
          <div className="sub header">{name}</div>
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
