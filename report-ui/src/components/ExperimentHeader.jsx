import React from "react";

export default class ExperimentHeader extends React.Component {
    render() {
        const tags = this.props.tags.map(tagElement => {
            return <span className={"uk-badge"} key={tagElement}>{tagElement}</span>
        })
        console.log(this.props)
        return (
            <div className={"uk-card uk-card-default uk-card-body"}>
                <h1>{this.props.id}</h1>
                <div>
                    {tags}
                </div>
                <p>Name: {this.props.name}</p>
                <p>{this.props.description}</p>
                <p>Created {this.props.created}</p>
                <p>Finished {this.props.finished}</p>
            </div>
        )
    }
}