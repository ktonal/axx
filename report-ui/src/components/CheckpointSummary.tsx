import React from 'react';

const data = require("../data/babys/B-1/data.json");

function SummaryHeader(props: { name: string }) {
    return (
        <h3 className={"uk-heading-small"}>
            {props.name}
        </h3>
    )
}

function SummaryRow(props: { name: string, value: string }) {
    return (
        <tr key={props.name}>
            <td>{props.name}</td>
            <td>{props.value}</td>
        </tr>
    )
}

class CheckpointSummary extends React.Component {
    render() {
        const rows = [];
        for (let key in data) {
            if (typeof data[key] === "string") {
                rows.push(<SummaryRow name={key} value={data[key]} />)
            }
        }
        return (
            <div>
                <SummaryHeader name={data["id"]} />
                <table className="uk-table uk-table-divider">
                    {/* <thead><tr><th></th><th></th></tr></thead> */}
                    {rows}
                </table>

            </div>
        )
    }
}
export default CheckpointSummary;