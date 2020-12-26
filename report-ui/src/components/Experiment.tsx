import React from "react";
import axios from 'axios';

import Waveform from "./Waveform";
import ParameterSection from "./Parameter";
import ExperimentHeader from "./ExperimentHeader";

type ExperimentIdentifier = {
    projectName: string;
    id: string;
}

type ExperimentState = {
    projectName: string;
    id: string;
    audios: Array<string>;
    hparams: Array<{ name: string, value: string }>;
    properties: Array<{ name: string, value: string }>;
}

export default class Experiment extends React.Component<ExperimentIdentifier, ExperimentState> {
    constructor(props: ExperimentIdentifier) {
        super(props);
        this.state = {
            projectName: this.props.projectName,
            id: this.props.id,
            audios: [],
            hparams: [],
            properties: [],
        }
    }

    componentDidUpdate() {
        if ((this.props.projectName && this.props.id) && (this.state.id !== this.props.id)) {
            axios.get("http://localhost:5000/summary/" + this.props.projectName + "/" + this.props.id).then(
                response => this.setState({
                    projectName: this.props.projectName,
                    id: this.props.id,
                    audios: response.data.audios,
                    hparams: response.data.hparams,
                    properties: response.data.properties
                })
            )
        }
    }

    render() {
        const outputs: Array<React.ReactNode> = [];
        this.state.audios.forEach(audio => outputs.push(
            <React.Fragment key={audio}>
                <Waveform title={audio}
                          url={"http://localhost:5000/audio/"
                          + this.state.projectName
                          + "/" + this.state.id
                          + "/" + audio}/>
                <hr></hr>
            </React.Fragment>
        ))
        console.log("PROPS", this.state.properties.length)
        return (
            <div>
                {Object.keys(this.state.properties).length > 0 ?
                    <ExperimentHeader {...this.state.properties}/>
                    : null}
                <React.Fragment>
                    <ParameterSection title={"Hyper Parameters"}
                                      parameters={this.state.hparams}/>
                    <div className={"uk-card uk-card-default uk-card-body outputs"}>
                        <h3 className={"uk-card-title"}>Outputs</h3>
                        {outputs}
                    </div>
                </React.Fragment>
            </div>

        )
            ;
    }
}