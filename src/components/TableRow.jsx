import React from "react";
import * as PropTypes from "prop-types";

export function TableRow(props) {
    return <React.Fragment>
        {/* first we display the params of the experiment */}
        <tr {...props.row.getRowProps()}>
            {props.row.cells.map((cell, i) => <FormatedCell cell={cell} row={props.row} key={i}/>)}
        </tr>
        {/*then the audios if the row is expanded */}
        {(props.row.isExpanded && !props.row.cells.some(cell => cell.isGrouped)) &&
        props.audioRowRenderer
        }
    </React.Fragment>;
}

TableRow.propTypes = {
    row: PropTypes.any,
    audioRowRenderer: PropTypes.any
};

function FormatedCell(props) {
    return <td
        {...props.cell.getCellProps()}
        className={(props.cell.isGrouped
            ? "grouped-"
            : props.cell.isAggregated
                ? "aggregated-"
                : props.cell.isPlaceholder
                    ? "placeholder-" : "") + "cell"}>
        {props.cell.isGrouped ? (
            // If it's a grouped cell, add an expander and row count
            <>
          <span {...props.row.getToggleRowExpandedProps()}>
            {props.row.isExpanded ? <i className={"fa fa-chevron-down"}/> :
                <i className={"fa fa-chevron-right"}/>}
          </span>{" "}
                {props.cell.render("Cell")} ({props.row.subRows.length})
            </>
        ) : props.cell.isAggregated ? (
            // If the cell is aggregated, use the Aggregated
            // renderer for cell
            props.cell.render("Aggregated")
        ) : props.cell.isPlaceholder ? null : ( // For cells with repeated values, render null
            // Otherwise, just render the regular cell
            props.cell.render("Cell")
        )}
    </td>;
}

FormatedCell.propTypes = {
    cell: PropTypes.any,
    row: PropTypes.any
};