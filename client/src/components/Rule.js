import React from "react";

export const Rule = ({ data }) => {
  return (
    <div className="ui segment">
      <p>{data.value}</p>
      <div className="ui label">tag: {data.tag}</div>
      <div className="ui right floated negative button">Delete</div>
    </div>
  );
};

export default Rule;
