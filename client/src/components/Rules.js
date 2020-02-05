import React, { useState, useEffect } from "react";
import axios from "axios";
import Rule from "./Rule";

const Rules = () => {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await axios.get(
        "/api/labs/1/tweets/stream/filter/rules"
      );
      setRules(response.data.body.data);
      console.log(response.data.body.data);
    })();
  }, []);

  return (
    <React.Fragment>
      <div className="twelve wide column">
        <div className="ui fluid input">
          <input type="text" placeholder="Search..." />
          <button className="ui button">Add Rule</button>
        </div>
        <div className="ui segments">
          {rules.map(rule => (
            <Rule key={rule.id} data={rule} />
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Rules;
