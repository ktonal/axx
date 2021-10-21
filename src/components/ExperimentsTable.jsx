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

// Create an editable cell renderer
const EditableCell = ({
                          value: initialValue,
                          row: {index},
                          column: {id},
                          updateData, // This is a custom function that we supplied to our table instance
                      }) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue);

    const onChange = e => {
        setValue(e.target.value)
    };

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
        updateData(index, id, value)
    };

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue]);

    return <input value={value} onChange={onChange} onBlur={onBlur} type={"text"}
                  style={{color: "inherit", border: "0px", fontSize: "inherit"}}/>
};

const Table = ({inputColumns, data, updateData,
                   addRowIcon, addBlob, removeBlob}) => {
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
            columns: inputColumns,
            data,
            initialState: {
                groupBy: initialGroupBy,
                hiddenColumns: initialHidden
            },
            defaultColumn: {
                Cell: EditableCell,
            },
            updateData
        },
        useColumnOrder,
        useGlobalFilter,
        useGroupBy,
        useSortBy,
        useExpanded,
    );

    const audioRowRenderer = React.useCallback(
        ({row, colSpan}) => (
            <AudioRow row={row} colSpan={colSpan}
                      addBlob={addBlob}
                      removeBlob={removeBlob}
            />
        ),
        [addBlob, removeBlob]
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
            {addRowIcon()}
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

export default function ExperimentsTable({table}) {
    const {token} = React.useContext(AuthContext);
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
    useEffect(() => {
        axiosConfig.headers.Authorization = "Bearer " + token;
        axios.get("table/" + table, axiosConfig).then(response => {
            // COLUMNS
            let columns = new Set();
            response.data.view.forEach(col => {
                columns.add(col.key);
                if (col.visible) {
                    initialVisibleColumns.push(col.key)
                }
                if (col.grouped) {
                    initialGroupBy.push(col.key)
                }
            });
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
                        {(!row.cells.some(cell => cell.isGrouped) && row.original.audios) ?
                            ` (${row.original.audios.length.toString()})`
                            : null}
                        </span>
                )
            });
            setColumns(columns);
            setData(response.data.collections.map(coll => {
                return {"audios": coll["blobs"] || [], ...coll}
            }));
        }).catch(err => {
        })
    }, [table, token]);
    const updateData = (index, id, value) => {
        data[index][id] = value;
        setData([...data]);
        console.log("EDITED", index, id, value)
    };
    const addEmptyRow = () => {
        data.push({"audios": [], });
        setData([...data]);
    };
    function AddRowIcon() {
        return <i className={"fa fa-plus-circle"}
                  onClick={addEmptyRow}
                  style={{fontSize: "xx-large", padding: "8px"}}
        />
    }

    const addBlob = (index, blob) => {
        console.log(data[index]);
        data[index].audios.push(blob);
    };
    const removeBlob = (index, blobIndex) => {
        data[index].audios.splice(blobIndex, 1)
    };
    const memoColumns = useMemo(() => columns, [columns]);
    const memoData = useMemo(() => data, [data]);

    return (<>
        <Table inputColumns={memoColumns} data={memoData}
               updateData={updateData}
               addRowIcon={AddRowIcon}
               addBlob={addBlob}
               removeBlob={removeBlob}
        />
    </>)
}