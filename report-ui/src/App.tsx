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
            <div className={"uk-nav uk-nav-default"}>
                <h3 className={"uk-nav-header "}
                    style={{textAlign: "right"}}>
                    {"|{ A X X }|"}
                </h3>
                <div className="uk-container uk-container-large uk-width-expand App">
                    <Projects onChange={this.onExperimentClick}/>
                    {this.state.projectName ?
                        <Experiment projectName={name} id={id}/>
                        : <div className={"uk-text-center"} style={
                            {position: "absolute", top: "30%", left: "40%", height: "500px"}}
                        >
                            <span className={"uk-text-small uk-weight-small"}>
                                Download a project and click on an experiment to start exploring
                            </span>
                        </div>
                    }
                </div>
            </div>
        );
    }
}
/* - experiment header : ID, link to neptune, tags (= example's labels),( description,) losses, properties
* - hparams tree (data, model, optim)
* - list of available checkpoints
* - POST : tag, description, note / comment,
* - DELETE : audio, checkpoints
* - */