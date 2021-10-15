import React, {useEffect, useMemo, useState } from "react";
import { useCookies } from 'react-cookie';
import {useColumnOrder, useExpanded, useGlobalFilter, useGroupBy, useSortBy, useTable} from 'react-table';
import axios from "axios";
import '../App.scss';
import {ColumnManager} from "./ColumnManager";
import {GlobalFilter} from "./GlobalFilter";
import {AudioRow} from "./AudioRow";
import {TableRow} from "./TableRow";
import {TableHeader} from "./TableHeader";

const axiosConfig = {
    "baseURL": "https://bucket-proxy-uq7zn3wa7a-oa.a.run.app",
    "headers": {"Cache-Control": "no-store, no-cache", "Authorization": ""}
};

const initialGroupBy = [];
const initialVisibleColumns = ["Audios"];

const Table = ({inputColumns, data}) => {
    const initialHidden = inputColumns.filter(
        c => c.id.toUpperCase() !== c.id && !initialVisibleColumns.includes(c.Header))
        .map(c => c.id);
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
            <AudioRow row={row} colSpan={colSpan}/>
        ),
        []
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
                            <TableRow key={row.getRowProps().key} row={row}
                                      audioRowRenderer={audioRowRenderer({row: row, colSpan: allColumns.length})}/>
                        )
                    })}
                </tbody>
            </table>
        </>
    )
};

export default function ExperimentsTable() {
    const [cookies,] = useCookies(["user_id_token"]);
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
    useEffect(() => {
        axiosConfig.headers.Authorization = "Bearer " + cookies.user_id_token;
        axios.get("table/", axiosConfig).then(response => {
            // columns are dynamically defined so we need the set of
            // keys in all the experiments
            let columns = new Set();
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
            setData(Object.values(response.data).map(value => {return {"audios": value["audios"], ...value["json"]["network"]}}));
        }).catch(err => {})
    }, [cookies.user_id_token]);
    const audios = {};
    data.forEach((value, id) => audios[id] = value["audios"]);
    const memoColumns = useMemo(() => columns, [columns]);
    const memoData = useMemo(() => data, [data]);

    return (
        <Table inputColumns={memoColumns} data={memoData}/>
    )
}