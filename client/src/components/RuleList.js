import React, { useEffect, useReducer } from "react";
import axios from "axios";
import Rule from "./Rule";
import logger from "use-reducer-logger";
import ErrorMessage from "./ErrorMessage";

const reducer = (state, action) => {
  switch (action.type) {
    case "show_rules":
      return { ...state, rules: action.payload, newRule: "" };
    case "add_rule":
      return {
        ...state,
        rules: [...state.rules, ...action.payload],
        newRule: "",
        errors: []
      };
    case "add_errors":
      return { ...state, rules: state.rules, errors: action.payload };
    case "delete_rule":
      return {
        ...state,
        rules: [...state.rules.filter(rule => rule.id !== action.payload)]
      };
    case "rule_changed":
      return { ...state, newRule: action.payload };
    case "change_loading_status":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const RuleList = () => {
  const [state, dispatch] = useReducer(logger(reducer), {
    rules: [],
    newRule: "",
    isLoading: false,
    errors: []
  });

  const createRule = async ruleValue => {
    const payload = { add: [{ value: ruleValue }] };
    dispatch({ type: "change_loading_status", payload: true });
    const response = await axios.post(
      "/api/labs/1/tweets/stream/filter/rules",
      payload
    );
    if (response.data.body.errors)
      dispatch({ type: "add_errors", payload: response.data.body.errors });
    else {
      dispatch({ type: "add_rule", payload: response.data.body.data });
    }
    dispatch({ type: "change_loading_status", payload: false });
  };

  const deleteRule = async id => {
    const payload = { delete: { ids: [id] } };
    dispatch({ type: "change_loading_status", payload: true });
    await axios.post("/api/labs/1/tweets/stream/filter/rules", payload);
    dispatch({ type: "delete_rule", payload: id });
    dispatch({ type: "change_loading_status", payload: false });
  };

  const showErrors = () => {
    if (state.errors && state.errors.length > 0) {
      return state.errors.map(error => (
        <ErrorMessage key={error.title} error={error} />
      ));
    }
  };

  const showRules = () => {
    if (!state.isLoading) {
      if (state.rules && state.rules.length > 0) {
        return state.rules.map(rule => (
          <Rule key={rule.id} data={rule} onRuleDelete={id => deleteRule(id)} />
        ));
      } else {
        return (
          <div className="ui warning message">
            <p>
              There are currently no rules on this stream. Add a rule above. See
              the
              <a href="https://developer.twitter.com/en/docs/labs/filtered-stream/operators">
                &nbsp;queries guide&nbsp;
              </a>
              for reference.
            </p>
          </div>
        );
      }
    } else {
      return (
        <div className="ui active centered large inline loader">
          <p></p>
          <p></p>
        </div>
      );
    }
  };

  useEffect(() => {
    (async () => {
      dispatch({ type: "change_loading_status", payload: true });

      const response = await axios.get(
        "/api/labs/1/tweets/stream/filter/rules"
      );
      const { data: payload = [] } = response.data.body;
      dispatch({
        type: "show_rules",
        payload
      });
      dispatch({ type: "change_loading_status", payload: false });
    })();
  }, []);

  return (
    <React.Fragment>
      <div className="twelve wide column">
        <div className="ui fluid input">
          <input
            type="text"
            value={state.newRule}
            onChange={event =>
              dispatch({ type: "rule_changed", payload: event.target.value })
            }
          />
          <button
            className="ui primary button"
            onClick={event => createRule(state.newRule)}
          >
            Add Rule
          </button>
        </div>
        {showErrors()}
        {showRules()}
      </div>
    </React.Fragment>
  );
};

export default RuleList;
