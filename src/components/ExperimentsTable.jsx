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

let initialGroupBy = [];
let initialVisibleColumns = ["Audios"];

// Create an editable cell renderer
const EditableCell = ({
                          value: initialValue,
                          row: {index},
                          column: {id},
                          updateData, // This is a custom function that we supplied to our table instance
                      }) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState("");

    const onChange = e => {
        setValue(e.target.value)
    };

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
        updateData(index, id, value)
    };

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
        setValue(initialValue ? initialValue : "")
    }, [initialValue]);

    return <input value={value} onChange={onChange} onBlur={onBlur} type={"text"}
                  style={{color: "inherit", border: "0px", fontSize: "inherit", width: "75%"}}/>
};

const Table = ({
                   inputColumns, data, updateData,
                   addRowIcon, addBlob, removeBlob,
                   skipReset
               }) => {
    const initialHidden = inputColumns.filter(
        c => c.id.toUpperCase() !== c.id && !initialVisibleColumns.includes(c.Header))
        .map(c => c.id);
    // console.log("IN TABLE", inputColumns);
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
            autoResetExpanded: !skipReset.current,
            autoResetGroupBy: !skipReset.current,
            autoResetSortBy: !skipReset.current,
            updateData
        },
        useColumnOrder,
        useGlobalFilter,
        useGroupBy,
        useSortBy,
        useExpanded,
    );

    const audioRowRenderer = ({row, colSpan}) => {
        return <AudioRow row={row} colSpan={colSpan}
                         addBlob={addBlob}
                         removeBlob={removeBlob}
        />
    };
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
    const skipPageResetRef = React.useRef();

    useEffect(() => {
        skipPageResetRef.current = false;
        axiosConfig.headers.Authorization = "Bearer " + token;
        initialGroupBy = [];
        initialVisibleColumns = ["Audios"];
        // column for expanding/collapsing audios
        const audiosColumn = {
            Header: "Audios",
            id: 'expander',
            Cell: ({row}) => {
                const deleteRow = () => {
                    skipPageResetRef.current = true;
                    if (window.confirm("Are you sure you want to delete this row?")) {
                        const cascade = window.confirm("Do you wish to remove the associated audios from storage?");
                        if (cascade) {
                            row.original.blobs.forEach(blob => {
                                axios.delete(
                                    process.env.REACT_APP_BACKEND_URL + `/table/${table}/collections/${row.original.id}/blobs`,
                                    {
                                        headers: {
                                            "Authorization": "Bearer " + token,
                                            "Content-Type": "application/json"
                                        },
                                        data: {...blob}
                                    },
                                )
                            })
                        }
                        axios.delete(
                            process.env.REACT_APP_BACKEND_URL + `/table/${table}/collections/${row.original.id}`,
                            {
                                headers: {
                                    "Authorization": "Bearer " + token,
                                }
                            },).then(response => {
                            if (response.status === 200) {
                                setData(data => {data.splice(row.index, 1); return [...data]});
                            }})}
                };
                return <div className={"grouped-column"}
                            style={{width: "100%", display: "block"}}>

                    {(!row.cells.some(cell => cell.isGrouped) && row.original && row.original.blobs) ?
                        <>{row.isExpanded ?
                            <i className={"fa fa-chevron-down"}
                               {...row.getToggleRowExpandedProps()}
                            />
                            : <i className={"fa fa-chevron-right"}
                                 {...row.getToggleRowExpandedProps()}
                            />}
                            {` (${row.original.blobs.length.toString()})`}
                            <i className={"remove-button fa fa-times-circle"}
                               style={{float: "right"}}
                               onClick={deleteRow}
                            />
                        </>
                        : null}

                </div>
            }
        };
        axios.get("table/" + table, axiosConfig).then(response => {
            // COLUMNS
            let newColumns = new Set();
            // console.log("VIEW", response.data.view);
            response.data.view.forEach(col => {
                newColumns.add(col.key);
                if (col.visible) {
                    initialVisibleColumns.push(col.key)
                }
                if (col.grouped) {
                    initialGroupBy.push(col.key)
                }
            });
            newColumns = Array.from([...newColumns]);
            // format and prepend extra columns for the UI
            newColumns = newColumns.map(name => {
                return {Header: name, accessor: name, id: name}
            });
            setColumns([audiosColumn, ...newColumns]);
            setData(response.data.collections);
        }).catch(err => {
            console.log("LOAD TABLE", err.response.status, err.response.statusText, {...err})
        })
    }, [table, token]);
    const updateData = (index, id, value) => {
        skipPageResetRef.current = true;
        data[index][id] = value;
        setData([...data]);
        const collection = data[index];
        axios.put(
            process.env.REACT_APP_BACKEND_URL + `/table/${table}/collections/${data[index].id}`,
            {...collection},
            {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            }
        );
    };
    const addEmptyRow = () => {
        skipPageResetRef.current = true;
        const collection = columns.reduce((a, v) => ({...a, [v.Header]: ""}), {});
        // let form = new FormData();
        // form.append("collection", collection);
        axios.post(
            process.env.REACT_APP_BACKEND_URL + `/table/${table}/collections`,
            collection,
            {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            }
        ).then(res => {
            data.push(res.data);
            setData([...data]);
        }).catch(err => {
            console.error(err)
        })
    };

    function AddRowIcon() {
        return <i className={"fa fa-plus-circle"}
                  onClick={addEmptyRow}
                  style={{fontSize: "xx-large", padding: "8px"}}
        />
    }

    const addBlob = (index, blob) => {
        skipPageResetRef.current = true;
        console.log("BLOB", blob);
        const collectionId = data[index].id;
        axios.post(
            process.env.REACT_APP_BACKEND_URL + `/table/${table}/collections/${collectionId}/blobs`,
            {...blob},
            {headers: {"Authorization": "Bearer " + token, "Content-Type": "application/json"}}
        ).then(res => {
            data[index].blobs.push(res.data); // res.data == Blob
            setData([...data]);
        }).catch(err => console.error(err))
    };
    const removeBlob = (index, blobIndex) => {
        skipPageResetRef.current = true;
        const collectionId = data[index].id;
        const blob = data[index].blobs[blobIndex];
        axios.delete(
            process.env.REACT_APP_BACKEND_URL + `/table/${table}/collections/${collectionId}/blobs?bucket=${blob.bucket}`,
            {
                headers: {"Authorization": "Bearer " + token, "Content-Type": "application/json"},
                data: {...blob}
            },
        ).then(resp => {
                data[index].blobs.splice(blobIndex, 1);
                setData([...data]);
            }
        )
    };
    const memoColumns = useMemo(() => columns, [columns]);
    const memoData = useMemo(() => data, [data]);

    return (<>
        <Table inputColumns={memoColumns} data={memoData}
               updateData={updateData}
               addRowIcon={AddRowIcon}
               addBlob={addBlob}
               removeBlob={removeBlob}
               skipReset={skipPageResetRef}
        />
    </>)
}