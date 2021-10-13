import * as PropTypes from "prop-types";
import React from "react";

export function TableHeader(props) {
    return <thead>
    {props.headerGroups.map(headerGroup => (
        <TableHeaderRow headerGroup={headerGroup}/>
    ))}
    </thead>;
}

TableHeader.propTypes = {
    headerGroups: PropTypes.any,
};

function TableHeaderRow(props) {
    return <tr {...props.headerGroup.getHeaderGroupProps()}>
        {props.headerGroup.headers.map(column =>
            <TableHeaderColumn column={column} onClick={() => column.toggleHidden(true)}/>
        )}
    </tr>;
}

TableHeaderRow.propTypes = {
    headerGroup: PropTypes.any,
};

function TableHeaderColumn(props) {
    return <th {...props.column.getHeaderProps(props.column.getSortByToggleProps())}>
        {props.column.id === "expander" ?
            <span className={"column-title"}
                  style={{
                      top: "-1%",
                      left: "5%",
                      width: "100px"
                  }}>{props.column.render("Header")}</span>
            : <div className={"header-element"}>
                <span className={"column-title"}>{props.column.render("Header")}</span>
                {/* Add a sort direction indicator */}
                <span className={"column-icons"}>
                                            <i className={"fa fa-close"}
                                               onClick={props.onClick}
                                               style={{color: "#919191", width: "16px"}}
                                            />
                                            <i className={"fa fa-chevron-up"}
                                               style={{
                                                   color: props.column.isSortedDesc === undefined ? "#919191" : (props.column.isSortedDesc ? "green" : "#919191"),
                                               }}/>
                                            <i className={"fa fa-chevron-down"}
                                               style={{
                                                   color: props.column.isSortedDesc === undefined ? "#919191" : (!props.column.isSortedDesc ? "green" : "#919191"),
                                               }}/>
                    {props.column.canGroupBy ? (
                        // If the column can be grouped, let's add a toggle
                        <i {...props.column.getGroupByToggleProps()}
                           className={"fa fa-indent"}
                           style={{
                               color: props.column.isGrouped ? "green" : "#919191",
                           }}/>
                    ) : null}
                                        </span>
            </div>
        }
    </th>;
}

TableHeaderColumn.propTypes = {
    column: PropTypes.any,
    onClick: PropTypes.func
};