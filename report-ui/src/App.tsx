import React from "react";
import "./App.css";

// import Output from "./components/Output";
import Experiment from "./components/Experiment";

function App() {
  return (
    <div className="uk-container uk-container-small uk-position-relative">
      <Experiment experimentId={"MOD-32"}/>
    </div>
  );
}

export default App;
