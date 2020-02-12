import React from "react";

const ErrorMessage = ({ error }) => {
  const errorDetails = error => {
    if (error.details)
      return error.details.map(detail => <p key={detail}>{detail}</p>);
  };

  return (
    <div className="ui negative message">
      <div className="header">{error.title}</div>
      {errorDetails(error)}
      <em>
        See<a href={error.type}> error documentation </a>for more details.
      </em>
    </div>
  );
};

export default ErrorMessage;
