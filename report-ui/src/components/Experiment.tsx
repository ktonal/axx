import React, {useState} from 'react';
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


const ExperimentHeader: React.FunctionComponent<{ experimentId: ParamValue }> = ({experimentId}) => {
    return (
        <h4 className={"uk-heading-small"}>
            {experimentId}
        </h4>
    )
};

const ParameterRow: React.FunctionComponent<HParamRow> = ({name, value}) => {
    return (
        <tr>
            <td className={"uk-width-1-5"}>{name}</td>
            <td className={"uk-width-4-5 uk-text-truncate"}>{value}</td>
        </tr>
    )
};

const ParameterTable: React.FunctionComponent<{ tableName: string, params: ParamDict }> = ({tableName, params}) => {

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
                <ul className={"uk-accordion"}>
                    <ParameterTable tableName={"Properties"} params={this.state.properties}/>
                    <ParameterTable tableName={"Hparams"} params={this.state.hparams}/>
                </ul>
            </div>
        )
    }
}

export default Experiment;