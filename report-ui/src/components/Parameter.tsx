import React from 'react';
import "./Parameter.css";

type ParameterObject = {
    name: string;
    value: string;
}

const Parameter: React.FC<ParameterObject> = ({name, value}) => {
    return (
        <div className={"parameter"}>
            <div className={"param-name"}>{name + ":"}</div>
            <div className={"param-value"}>{value}</div>
        </div>
    )
}

type SectionProps = {
    title: string;
    parameters: Array<ParameterObject>;
}

export default class ParameterSection extends React.Component<SectionProps> {
    render() {
        const params: Array<React.ReactNode> = [];
        this.props.parameters.forEach(({name, value}) =>
            params.push(<Parameter key={name} name={name} value={value}/>))
        return (
            <div className={"parameter-section uk-card uk-card-default uk-card-body"}>
                <h3 className={"uk-card-title"}>
                    {this.props.title}
                </h3>
                {params}
            </div>
        )
    }
}