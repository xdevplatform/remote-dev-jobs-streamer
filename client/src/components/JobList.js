import React, { useEffect, useReducer } from "react";
import Job from "./Job";
import http from "http";
import socketIOClient from "socket.io-client";
import ErrorMessage from "./ErrorMessage";

const reducer = (state, action) => {
  switch (action.type) {
    case "add_job":
      return { ...state, jobs: [action.payload, ...state.jobs] };
    case "show_error":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const JobList = () => {
  const initialState = { jobs: [], error: {} };
  const [state, dispatch] = useReducer(reducer, initialState);
  const { jobs, error } = state;

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
      return <ErrorMessage key={error} error={error} styleType="warning" />;
    }
  };

  useEffect(() => {
    const socket = streamTweets();
    return () => {
      socket.disconnect(true);
    };
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
    } else {
      return (
        <React.Fragment>
          <div className="twelve wide column">
            {showError()}{" "}
            <div className="ui active centered large inline loader">
              <img
                className="ui image"
                src="/Twitter_Logo_Blue.png"
                alt="Twitter Logo"
              />
            </div>
          </div>
        </React.Fragment>
      );
    }
  };

  return <div className="twelve wide stretched column">{showJobs()}</div>;
};

export default JobList;
