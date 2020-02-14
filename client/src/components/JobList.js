import React, { useEffect, useReducer } from "react";
import Job from "./Job";
import http from "http";

const reducer = (state, action) => {
  switch (action.type) {
    case "add_job":
      return [action.payload, ...state];
    default:
      return state;
  }
};

const JobList = () => {
  const [state, dispatch] = useReducer(reducer, []);
  const jobs = state;
  let timeout = 0;

  const sleep = async delay => {
    return new Promise(resolve => setTimeout(() => resolve(true), delay));
  };

  const streamJobs = () => {
    const req = http.get("/api/stream/filter", stream => {
      stream.on("data", async data => {
        try {
          const json = JSON.parse(data);
          if (json.data) {
            dispatch({ type: "add_job", payload: json });
          } else {
            throw new Error(json.error);
          }
        } catch (e) {
          // Connection time out or too many connections
          console.log("Error: ", e);
          timeout++;
          req.abort();
          await sleep(2 ** timeout * 1000);
          streamJobs();
        }
      });
    });
  };

  useEffect(() => {
    streamJobs();
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
        <div className="ui active centered large inline loader">
          <img
            className="ui image"
            src="/Twitter_Logo_Blue.png"
            alt="Twitter Logo"
          />
        </div>
      );
    }
  };

  return <div className="twelve wide stretched column">{showJobs()}</div>;
};

export default JobList;
