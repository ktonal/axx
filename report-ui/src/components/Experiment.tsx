import React, {ReactNode, useState} from 'react';
import axios from 'axios';

import './style.css';

type ParamValue = string | number;

type HParamRow = {
    name: string;
    value: ParamValue;
};

type ParamDict = { [key: string]: ParamValue };

interface ExperimentProps {
    experimentId: string,
}


interface ExperimentState {
    audios: Array<string>;
    hparams: ParamDict;
    properties: ParamDict;
}


const ExperimentHeader: React.FC<{ experimentId: ParamValue }> = ({experimentId}) => {
    return (
        <h4 className={"uk-heading-small"}>
            {experimentId}
        </h4>
    )
};

const ParameterRow: React.FC<HParamRow> = ({name, value}) => {
    return (
        <tr>
            <td className={"uk-width-1-5"}>{name}</td>
            <td className={"uk-width-4-5 uk-text-truncate"}>{value}</td>
        </tr>
    )
};

const ParameterTable: React.FC<{ tableName: string, params: ParamDict }> = ({tableName, params}) => {

    const [displayed, setDisplay] = useState(false);

    const body = [];
    for (let key in params) {
        body.push(<ParameterRow key={key} name={key}
                                value={typeof params[key] === "string" ? params[key] : params[key].toString()}/>)
    }
    return (
        <div>
            <li className={(displayed ? "uk-open " : "")}>
                <a className={"uk-accordion-title experiment-header"}
                   aria-expanded={displayed}
                   onClick={() => setDisplay(!displayed)}>
                    {tableName}
                </a>
                {displayed &&
                <div className={"uk-accordion-content"}>
                    <table className="uk-table uk-table-small uk-table-divider uk-text-nowrap parameter-table ">
                        <tbody>{body}</tbody>
                    </table>
                </div>}
            </li>
        </div>
    )
};


type AudioFiles = Array<string>;


class WaveForm extends React.Component<{ file: string, experimentId: string }> {

    render() {
        const file = this.props.file;
        const experimentId = this.props.experimentId;
        return (
            <div key={file} id={"container"}>
                <legend>{file}</legend>
                <audio className={"audio-player"}
                       controls
                       src={"http://localhost:5000/audio/" + experimentId + "/" + file}/>
            </div>
        )
    }
}

const AudioGrid: React.FC<{ experimentId: ParamValue, files: AudioFiles }> = ({experimentId, files}) => {
    const audios: Array<JSX.Element> = [];
    files.map(file => {
        audios.push(
            <WaveForm file={file}
                      experimentId={typeof experimentId === "string" ? experimentId : experimentId.toString()}/>
        )
    });
    return (
        <div className={"audio-grid uk-flex uk-flex-wrap uk-grid-small uk-child-width-1-3"}>
            {audios}
        </div>
    )
};

class Experiment extends React.Component<ExperimentProps, ExperimentState> {

    state: ExperimentState = {
        audios: [],
        hparams: {},
        properties: {},
    };

    componentDidMount() {
        axios.get("http://localhost:5000/summary/MOD-32").then(response => {
            this.setState({...response.data})
        });
    }

    render() {
        return (
            <div>
                <ExperimentHeader experimentId={this.state.properties.id}/>
                <AudioGrid experimentId={this.state.properties.id} files={this.state.audios}/>
                <ul className={"uk-accordion"}>
                    <ParameterTable tableName={"Properties"} params={this.state.properties}/>
                    <ParameterTable tableName={"Hparams"} params={this.state.hparams}/>
                </ul>
            </div>
        )
    }
}

export default Experiment;