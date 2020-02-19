import React, { useEffect, useReducer } from "react";
import Job from "./Job";
import socketIOClient from "socket.io-client";
import ErrorMessage from "./ErrorMessage";

const reducer = (state, action) => {
  switch (action.type) {
    case "add_job":
      return {
        ...state,
        jobs: [action.payload, ...state.jobs],
        jobsLastUpdated: Math.floor(Date.now() / 1000)
      };
    case "show_error":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const JobList = () => {
  const initialState = {
    jobs: [],
    error: {},
    jobsLastUpdated: Math.floor(Date.now() / 1000)
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const { jobs, error, jobsLastUpdated } = state;

  const streamTweets = () => {
    const socket = socketIOClient("/");
    socket.on("connect", () => console.log("Client connected"));
    socket.on("tweet", json => {
      console.log("json =>", json);

      if (json.data) {
        console.log("dispatching action");
        dispatch({ type: "add_job", payload: json });
      }
    });
    socket.on("error", data => {
      console.log("connection error =>", data);
      dispatch({ type: "show_error", payload: data });
    });

    return socket;
  };

  const showError = () => {
    if (error && error.detail) {
      return (
        <div className="twelve wide column">
          <ErrorMessage key={error} error={error} styleType="warning" />
        </div>
      );
    }
  };

  const showSpinner = () => {
    let message = "";
    if (error.title === "ConnectionException") {
      message = "Reconnecting...";
    }
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
    const lastUpdate = Math.floor(Date.now() / 1000) - jobsLastUpdated;
    const message = {
      title: "Still working",
      detail: "Waiting for new jobs to be Tweeted"
    };

    if (lastUpdate > 5) {
      return (
        <React.Fragment>
          <div className="twelve wide column">
            <ErrorMessage key={message} error={message} styleType="success" />
          </div>
          {showSpinner()}
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
    } else if (error) {
      return (
        <React.Fragment>
          {showError()}
          {showSpinner()}
        </React.Fragment>
      );
    } else {
      return <React.Fragment>{waitingMessage()}</React.Fragment>;
    }
  };

  return <div className="twelve wide stretched column">{showJobs()}</div>;
};

export default JobList;
