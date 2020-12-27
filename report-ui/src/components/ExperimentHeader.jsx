import React from "react";
// import axios from 'axios';


export default class ExperimentHeader extends React.Component {


    render() {
        const tags = this.props.tags.map(tagElement => {
            return <span className={"uk-badge"} key={tagElement}>{"#" + tagElement}</span>
        })
        const logs = [];
        for (let name in this.props.channels) {
            logs.push(
                <span className={"channel"} key={name}>
                <span className={"channel-name"}>{name + ":"}</span>
                <span className={"channel-value"}>{this.props.channels[name]}</span>
                </span>);
        }
        return (
            <div className={"experiment-header uk-card uk-card-default uk-card-body"}>
                <h1>{this.props.id}</h1>
                <div>
                    {/*<span className={"uk-icon"}*/}
                    {/*      data-uk-icon={"pen"}*/}
                    {/*      onClick={}/>*/}
                    {tags}
                </div>
                <div className={"channels"}>
                    {logs}
                </div>
                <div className={"property"}>
                    <span className={"prop-name"}>Name: </span>
                    <span className={"prop-value"}>{this.props.name}</span>
                </div>
                <div className={"property"}>
                    <span className={"prop-name"}>Description: </span>
                    <span className={"prop-value"}>{this.props.description}</span>
                </div>
                <div className={"property"}>
                    <span className={"prop-name"}>Created: </span>
                    <span className={"prop-value"}>{this.props.created}</span>
                </div>
                <div className={"property"}>
                    <span className={"prop-name"}>Finished: </span>
                    <span className={"prop-value"}>{this.props.finished}</span>
                </div>
            </div>
        )
    }
}