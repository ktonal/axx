import React, {useEffect, useMemo, useState} from "react";
import {useColumnOrder, useExpanded, useGlobalFilter, useGroupBy, useSortBy, useTable} from 'react-table';
import axios from "axios";
import '../App.scss';
import {AuthContext} from "./Auth";
import {ColumnManager} from "./ColumnManager";
import {GlobalFilter} from "./GlobalFilter";
import {AudioRow} from "./AudioRow";
import {TableRow} from "./TableRow";
import {TableHeader} from "./TableHeader";

const axiosConfig = {
    "baseURL": process.env.REACT_APP_BACKEND_URL,
    "headers": {"Cache-Control": "no-store, no-cache", "Authorization": ""}
};

const initialGroupBy = [];
const initialVisibleColumns = ["Audios"];

const Table = ({inputColumns, data}) => {
    const {token} = React.useContext(AuthContext);
    // const initialHidden = inputColumns.filter(
    //     c => c.id.toUpperCase() !== c.id && !initialVisibleColumns.includes(c.Header))
    //     .map(c => c.id);
    const initialHidden = [];
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        allColumns,
        getToggleHideAllColumnsProps,
        setColumnOrder,
        state,
        setGlobalFilter
    } = useTable({
            columns: inputColumns, data,
            initialState: {
                groupBy: initialGroupBy,
                hiddenColumns: initialHidden
            }
        },
        useColumnOrder,
        useGlobalFilter,
        useGroupBy,
        useSortBy,
        useExpanded,
    );
    const audioRowRenderer = React.useCallback(
        ({row, colSpan}) => (
            <AudioRow row={row} colSpan={colSpan} token={token}/>
        ),
        [token]
    );

    return (
        <>
            <div className={"control-panel"}>
                {/* Global Filter */}
                <ColumnManager getToggleHideAllColumnsProps={getToggleHideAllColumnsProps}
                               allColumns={allColumns}
                               setColumnOrder={setColumnOrder}
                />
                <GlobalFilter
                    globalFilter={state.globalFilter}
                    setGlobalFilter={setGlobalFilter}
                />
                <br/>
                {/*<div style={{margin: "auto", width: "max-content"}}>Displaying {rows.length} results</div>*/}
            </div>
            {/*<pre>{JSON.stringify(state, null, 2)}</pre>*/}
            {/* The Table */}
            <br/>
            <table {...getTableProps()}>
                <TableHeader headerGroups={headerGroups}/>
                <tbody {...getTableBodyProps()}>
                {rows.map(
                    (row, i) => {
                        prepareRow(row);
                        return (
                            <TableRow key={i} row={row}
                                      audioRowRenderer={audioRowRenderer({row: row, colSpan: allColumns.length})}/>
                        )
                    })}
                </tbody>
            </table>
        </>
    )
};

export default function ExperimentsTable() {
    const {token} = React.useContext(AuthContext);
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
    useEffect(() => {
        axiosConfig.headers.Authorization = "Bearer " + token;
        axios.get("table/", axiosConfig).then(response => {
            // columns are dynamically defined so we need the set of
            // keys in all the experiments
            let columns = new Set();
            // console.log(response.data);

            Object.values(response.data).forEach(
                item => Object.keys(item["json"]["network"]).forEach(key => {
                    if (!["_id", "audios"].includes(key)) {
                        columns.add(key)
                    }
                }));
            columns = Array.from([...columns]);
            // format and prepend extra columns for the UI
            columns = columns.map(name => {
                return {Header: name, accessor: name, id: name}
            });
            // column for expanding/collapsing audios
            columns.unshift({
                Header: "Audios",
                id: 'expander',
                Cell: ({row}) => (
                    <span {...row.getToggleRowExpandedProps()} className={"grouped-column"}>
                            {row.isExpanded ?
                                <i className={"fa fa-chevron-down"}/>
                                : <i className={"fa fa-chevron-right"}/>}
                        {(!row.cells.some(cell => cell.isGrouped) && row.original.hasOwnProperty("audios")) ?
                            ` (${row.original.audios.length.toString()})`
                            : null}
                        </span>
                )
            });
            setColumns(columns);
            initialVisibleColumns.push(...columns);
            setData(Object.values(response.data).map(value => {
                return {"audios": value["audios"], ...value["json"]["network"]}
            }));
        }).catch(err => {
        })
    }, [token]);
    const audios = {};
    data.forEach((value, id) => audios[id] = value["audios"]);
    // console.log(data);
    const memoColumns = useMemo(() => columns, [columns]);
    const memoData = useMemo(() => data, [data]);

    return (
        <Table inputColumns={memoColumns} data={memoData}/>
    )
}