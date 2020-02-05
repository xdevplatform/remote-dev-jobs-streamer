import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="three wide column">
      <div className="ui vertical pointing menu">
        <Link to="/jobs/recent" className="active item">
          Recent Jobs
        </Link>
        <Link to="/jobs/annotations" className="item">
          New Jobs
        </Link>
        <Link to="/rules" className="item">
          Manage Rules
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
