import React, { useEffect, useReducer } from "react";
import Job from "./Job";
import socketIOClient from "socket.io-client";
import ErrorMessage from "./ErrorMessage";
import Spinner from "./Spinner";

const reducer = (state, action) => {
  switch (action.type) {
    case "add_job":
      return {
        ...state,
        jobs: [action.payload, ...state.jobs],
        error: null,
        isWaiting: false
      };
    case "show_error":
      return { ...state, error: action.payload, isWaiting: false };
    case "update_waiting":
      return { ...state, error: null, isWaiting: true };
    default:
      return state;
  }
};

const JobList = () => {
  const initialState = {
    jobs: [],
    error: {},
    isWaiting: true
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const { jobs, error, isWaiting } = state;

  const streamTweets = () => {
    const socket = socketIOClient("/");
    socket.on("connect", () => {});
    socket.on("tweet", json => {
      if (json.data) {
        dispatch({ type: "add_job", payload: json });
      }
    });
    socket.on("heartbeat", data => {
      dispatch({ type: "update_waiting" });
    });
    socket.on("error", data => {
      dispatch({ type: "show_error", payload: data });
    });
  };

  const errorMessage = () => {
    const message = {
      title: "Reconnecting",
      detail: "Please wait while we reconnect to the stream."
    };

    if (error && error.detail) {
      return (
        <div className="twelve wide column">
          <ErrorMessage key={error.title} error={error} styleType="warning" />
          <ErrorMessage
            key={message.title}
            error={message}
            styleType="success"
          />
          <Spinner />
        </div>
      );
    }
  };

  const waitingMessage = () => {
    const message = {
      title: "Still working",
      detail: "Waiting for new jobs to be Tweeted"
    };

    if (isWaiting) {
      return (
        <React.Fragment>
          <div className="twelve wide column">
            <ErrorMessage
              key={message.title}
              error={message}
              styleType="success"
            />
          </div>
          <Spinner />
        </React.Fragment>
      );
    }
  };

  useEffect(() => {
    streamTweets();
  }, []);

  const showJobs = () => {
    if (jobs.length > 0) {
      return (
        <div className="ui segments">
          {jobs.map(job => (
            <Job key={job.data.id} json={job} />
          ))}
        </div>
      );
    }
  };

  return (
    <div className="twelve wide stretched column">
      {errorMessage()}
      {waitingMessage()}
      {showJobs()}
    </div>
  );
};

export default JobList;
