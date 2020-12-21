import React from "react";
import "./App.css";

// import Output from "./components/Output";
import CheckpointSummary from "./components/CheckpointSummary";

function App() {
  return (
    <div className="uk-container uk-container-small uk-position-relative">
      <h1 className={"uk-heading-small"}>This is a test</h1>
      <CheckpointSummary />
    </div>
  );
}

export default App;
