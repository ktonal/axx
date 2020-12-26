import React from "react";
import "./App.css";

import Projects from "./components/Projects";
import Experiment from "./components/Experiment";

export default class App extends React.Component<{ }, {projectName: string, id: string}>{
    constructor(props: any) {
        super(props);
        this.state = {
            projectName: "",
            id: "",
        }
        this.onExperimentClick = this.onExperimentClick.bind(this);
    }
    onExperimentClick(proj: string, id: string){
        this.setState({projectName: proj.split("/")[1], id: id})
    }

    render() {
        const name = this.state.projectName;
        const id = this.state.id;
        return (
            <div className="uk-container uk-container-large uk-width-expand App">
                <Projects onChange={this.onExperimentClick}/>
                <Experiment projectName={name} id={id}/>
            </div>
        );
    }
}
/* - useContext in experiment update
* - experiment header : ID, tags (= example's labels),( description,) losses, properties
* - hparams tree (data, model, optim)
* - clean up css!
* - nav : margins
* - jsx -> tsx
* - */