import React, { useEffect, useReducer } from "react";
import Job from "./Job";
import socketIOClient from "socket.io-client";
import ErrorMessage from "./ErrorMessage";
import logger from "use-reducer-logger";

const reducer = (state, action) => {
  switch (action.type) {
    case "add_job":
      return {
        ...state,
        jobs: [action.payload, ...state.jobs],
        isWaitingForJobs: false
      };
    case "show_error":
      return { ...state, error: action.payload, isWaitingForJobs: false };
    case "update_waiting":
      return { ...state, error: null, isWaitingForJobs: true };
    default:
      return state;
  }
};

const JobList = () => {
  const initialState = {
    jobs: [],
    error: {},
    isWaitingForJobs: true
  };

  const [state, dispatch] = useReducer(logger(reducer), initialState);
  const { jobs, error, isWaitingForJobs } = state;

  const streamTweets = () => {
    const socket = socketIOClient("/");
    socket.on("connect", () => console.log("Client connected"));
    socket.on("tweet", json => {
      if (json.data) {
        dispatch({ type: "add_job", payload: json });
      }
    });
    socket.on("waiting", data => {
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
        </div>
      );
    }
  };

  const spinner = () => {
    return (
      <div className="twelve wide column">
        <div className="ui active centered large inline loader">
          <img
            className="ui image"
            src="/Twitter_Logo_Blue.png"
            alt="Twitter Logo"
          />
        </div>
      </div>
    );
  };

  const waitingMessage = () => {
    const message = {
      title: "Still working",
      detail: "Waiting for new jobs to be Tweeted"
    };

    if (isWaitingForJobs) {
      return (
        <React.Fragment>
          <div className="twelve wide column">
            <ErrorMessage
              key={message.title}
              error={message}
              styleType="success"
            />
          </div>
          {spinner()}
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
        <React.Fragment>
          {waitingMessage()}
          <div className="ui segments">
            {jobs.map(job => (
              <Job key={job.data.id} json={job} />
            ))}
          </div>
        </React.Fragment>
      );
    } else if (error) {
      return (
        <React.Fragment>
          {errorMessage()}
          {spinner()}
        </React.Fragment>
      );
    } else {
      return <React.Fragment>{waitingMessage()}</React.Fragment>;
    }
  };

  return <div className="twelve wide stretched column">{showJobs()}</div>;
};

export default JobList;
