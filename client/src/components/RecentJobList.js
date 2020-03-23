import React, { useEffect, useReducer } from "react";
import Job from "./Job";
import Spinner from "./Spinner";
import Axios from "axios";

const reducer = (state, action) => {
  switch (action.type) {
    case "add_jobs":
      return { ...state, jobs: action.payload };
    case "change_loading_status":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const RecentJobList = () => {
  const initialState = { jobs: [], isLoading: false };

  const [state, dispatch] = useReducer(reducer, initialState);
  const { jobs } = state;

  const searchTweets = () => {
    dispatch({ type: "change_loading_status", payload: true });
    const response = Axios.get("/recent");
    dispatch({ type: "add_jobs", payload: response.data });
    dispatch({ type: "change_loading_status", payload: false });
  };

  useEffect(() => {
    searchTweets();
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

  return <div className="twelve wide stretched column">{showJobs()}</div>;
};

export default JobList;
