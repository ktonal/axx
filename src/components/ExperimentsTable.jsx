import React, {useMemo, useState, useEffect} from "react";
import {
    useTable,
    useSortBy,
    useExpanded,
    useGroupBy,
    useColumnOrder,
    useGlobalFilter,
    useAsyncDebounce
} from 'react-table';
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";
import Waveform from "./Waveform";

import '../App.scss';

const jsonData = require("../experiments.json");

function ColumnManager({getToggleHideAllColumnsProps, allColumns, setColumnOrder}) {
    const [stateCols, setState] = useState([]);

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        if (result[startIndex].isGrouped) {
            return result
        }
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const sortColumns = (columns) => {
        // console.log(columns.filter(c => c.isGrouped).length);
        return [
            ...columns.filter(c => c.isGrouped),
            ...columns.filter(c => c.isVisible && !c.isGrouped),
            ...columns.filter(c => !c.isVisible)
        ]
    };

    useEffect(() => {
        // console.log("SETTING STATE:", sortColumns(allColumns).map(c => c.id));
        setState(sortColumns(allColumns));
    }, [allColumns, setColumnOrder]);

    function onDragEnd(result) {
        if (!result.destination) {
            return;
        }

        if (result.destination.index === result.source.index) {
            return;
        }
        const columns = reorder(
            stateCols,
            result.source.index,
            result.destination.index
        );
        // console.log("REORDERED:", sortColumns(columns).map(c => c.id));
        setColumnOrder(sortColumns(columns).map(c => c.id));
    }

    return (
        <div className={"column-manager"}>
            <div className={"content"}>
                <div className={"column-toggle"}>
                    <label>
                        <input type="checkbox" style={{display: 'none'}}
                               onChange={getToggleHideAllColumnsProps().onChange}>
                        </input><i
                        className={"fa " + (getToggleHideAllColumnsProps().checked ? "fa-eye" : "fa-eye-slash")}>{' '}</i>
                        <span className={"column-name"}>{"All columns"}</span>
                    </label>
                </div>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={"list"}>
                        {provided => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                {stateCols.map((column, index) => (

                                    <Draggable key={column.id} index={index} draggableId={column.id}>
                                        {provided => (
                                            <div className={"column-toggle"}>
                                                <label
                                                    ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                    <input type="checkbox" style={{display: 'none'}}
                                                           onChange={column.getToggleHiddenProps().onChange}>
                                                    </input><i
                                                    className={"fa " + (column.isVisible ? "fa-eye" : "fa-eye-slash")}>{' '}</i>
                                                    <span className={"column-name"}>{column.Header}</span>
                                                </label>
                                            </div>)}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    )
}

// simple filter
function GlobalFilter({
                          globalFilter,
                          setGlobalFilter,
                      }) {
    const [value, setValue] = React.useState(globalFilter);
    const onChange = useAsyncDebounce(value => {
        setGlobalFilter(value || undefined)
    }, 200);

    return (
        <div className={"search-bar"}>
            <input
                value={value || ""}
                onChange={e => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder={`Search : ...`}
                style={{
                    fontSize: '1.1rem',
                }}
            />
        </div>
    )
}

const AudioRow = React.memo(({row, colSpan}) => {
    // console.log(row.getRowProps());
    const [audiosURLs, setAudiosUrls] = React.useState(row.original["audios"]);
    React.useEffect(() => setAudiosUrls(row.original["audios"]), [row]);
    return <tr {...row.getRowProps()}>
        <td colSpan={colSpan} className={"audio-container"}>
            {audiosURLs ?
                audiosURLs.map((x, i) => {
                    return <Waveform
                        key={x}
                        url={process.env.PUBLIC_URL + x}
                        title={x.split("/")[4]}
                        handleFinish={() => {
                            const list = audiosURLs;
                            const index = list.indexOf(x) + 1;
                            if (index < list.length) {
                                const id = list[index].split("/")[4];
                                const element = document.getElementById("play-" + id);
                                element.click()
                            }
                        }}
                    />
                })
                : <span style={{fontSize: "x-large"}}>No audio...</span>}
        </td>
    </tr>
});

const initialVisibleColumns = [
    "Audios", 'model_class', 'files',
    "id", 'epoch',
    'frame_sizes',
    'net_dim',
    'emb_dim',
    'mlp_dim',
    'n_rnn',
    'max_lr',
    'emphasis', 'sr',
    'n_fft',
    'n_layers',
    'gate_dim',
    'kernel_size',
    'reset_hidden',
];

const Table = ({inputColumns, data}) => {
    const initialGroupBy = ["model_class", "id"];
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
                <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                {column.id === "expander" ?
                                    <span className={"column-title"}
                                          style={{
                                              top: "-1%",
                                              left: "5%",
                                              width: "100px"
                                          }}>{column.render('Header')}</span>
                                    : <div className={"header-element"}>
                                        <span className={"column-title"}>{column.render('Header')}</span>
                                        {/* Add a sort direction indicator */}
                                        <span className={"column-icons"}>
                                            <i className={"fa fa-close"}
                                               onClick={() => column.toggleHidden(true)}
                                               style={{color: "#919191", width: "16px"}}
                                            />
                                            <i className={"fa fa-chevron-up"}
                                               style={{
                                                   color: column.isSortedDesc === undefined ? "#919191" : (column.isSortedDesc ? "green" : '#919191'),
                                               }}/>
                                            <i className={"fa fa-chevron-down"}
                                               style={{
                                                   color: column.isSortedDesc === undefined ? "#919191" : (!column.isSortedDesc ? "green" : '#919191'),
                                               }}/>
                                            {column.canGroupBy ? (
                                                // If the column can be grouped, let's add a toggle
                                                <i {...column.getGroupByToggleProps()}
                                                   className={"fa fa-indent"}
                                                   style={{
                                                       color: column.isGrouped ? "green" : '#919191',
                                                   }}/>
                                            ) : null}
                                        </span>
                                    </div>
                                }
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                {rows.map(
                    (row, i) => {
                        prepareRow(row);
                        return (
                            <React.Fragment key={row.getRowProps().key}>
                                {/* first we display the params of the experiment */}
                                <tr {...row.getRowProps()}>
                                    {row.cells.map(cell => {
                                        return (
                                            <td
                                                {...cell.getCellProps()}
                                                className={(cell.isGrouped
                                                    ? "grouped-"
                                                    : cell.isAggregated
                                                        ? "aggregated-"
                                                        : cell.isPlaceholder
                                                            ? "placeholder-" : "") + "cell"}>
                                                {cell.isGrouped ? (
                                                    // If it's a grouped cell, add an expander and row count
                                                    <>
                                                  <span {...row.getToggleRowExpandedProps()}>
                                                    {row.isExpanded ? <i className={"fa fa-chevron-down"}/> :
                                                        <i className={"fa fa-chevron-right"}/>}
                                                  </span>{' '}
                                                        {cell.render('Cell')} ({row.subRows.length})
                                                    </>
                                                ) : cell.isAggregated ? (
                                                    // If the cell is aggregated, use the Aggregated
                                                    // renderer for cell
                                                    cell.render('Aggregated')
                                                ) : cell.isPlaceholder ? null : ( // For cells with repeated values, render null
                                                    // Otherwise, just render the regular cell
                                                    cell.render('Cell')
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                                {/*then the audios if the row is expanded */}
                                {(row.isExpanded && !row.cells.some(cell => cell.isGrouped)) &&
                                audioRowRenderer({row: row, colSpan: allColumns.length})
                                }
                            </React.Fragment>
                        )
                    }
                )}
                </tbody>
            </table>
        </>
    )
};

export default function ExperimentsTable() {
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
    useEffect(() => {
        // columns are dynamically defined so we need the set of
        // keys in all the experiments
        let columns = new Set();
        jsonData.forEach(
            item => Object.keys(item).forEach(val => {
                if (!["_id", "audios"].includes(val)) {
                    columns.add(val)
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
        setData(jsonData);
    }, []);
    const audios = {};
    data.forEach(exp => audios[exp.id] = exp.audios);
    const memoColumns = useMemo(() => columns, [columns]);
    const memoData = useMemo(() => data, [data]);
    // console.log(memoColumns);

    return (
        <Table inputColumns={memoColumns} data={memoData}/>
    )
}