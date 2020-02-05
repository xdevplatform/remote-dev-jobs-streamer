import React from "react";
import { BrowserRouter, Route } from "react-router-dom";

import Navbar from "./Navbar";
import TweetList from "./TweetList";
import AnnotationTweets from "./AnnotationTweets";
import Rules from "./Rules";

class App extends React.Component {
  render() {
    return (
      <div className="ui container">
        <div className="introduction"></div>

        <h1 className="ui header">
          <img
            className="ui image"
            src="/Twitter_Logo_Blue.png"
            alt="Twitter Logo"
          />
          <div class="content">
            Remote Developer Jobs{" "}
            <div className="sub header">Powered by Twitter data</div>
          </div>
        </h1>

        <div className="ui grid">
          <BrowserRouter>
            <Navbar />
            <Route exact path="/jobs/recent" component={TweetList} />
            <Route exact path="/rules" component={Rules} />
            <Route
              exact
              path="/jobs/annotations"
              component={AnnotationTweets}
            />
          </BrowserRouter>
        </div>
      </div>
    );
  }
}

export default App;
