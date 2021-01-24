import React, {useMemo, useState, useEffect} from "react";
import axios from 'axios';
import ReactTable, {
    useTable,
    useSortBy,
    useExpanded,
    useGroupBy,
    useColumnOrder,
    useFilters,
    useGlobalFilter,
    useAsyncDebounce
} from 'react-table';
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";
import Waveform from "./Waveform";


function ColumnManager({getToggleHideAllColumnsProps, allColumns, setColumnOrder}) {
    const [stateCols, setState] = useState([]);

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        if (result[startIndex].isGrouped) { return result }
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    useEffect(() => {
        if (stateCols.length === 0) {
            console.log("SETTING ALL:", allColumns.map(c => c.id));
            setState([
                ...allColumns.filter(c => c.isGrouped),
                ...allColumns.filter(c => c.isVisible && !c.isGrouped),
                ...allColumns.filter(c => !c.isVisible)]
            )
        }
    }, [stateCols.length, allColumns]);

    useEffect(() => {
        if (stateCols.length > 0) {
            setColumnOrder(stateCols.map(c => c.id))
        }
    }, [stateCols, setColumnOrder]);

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
        console.log("REORDERED:", columns.map(c => c.id));
        setState([
                ...columns.filter(c => c.isGrouped),
                ...columns.filter(c => c.isVisible && !c.isGrouped),
                ...columns.filter(c => !c.isVisible)]);
    }

    return (
        <div className={"column-manager"}>
            <div className={"column-toggle"}>
                <label>
                    <input type="checkbox" {...getToggleHideAllColumnsProps()} />{' '}
                    {"All columns"}
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
                                                <input type="checkbox" {...column.getToggleHiddenProps()} />{' '}
                                                {column.Header}
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

const Table = ({columns, data, audios}) => {
    const initialGroupBy = ["project", "DB"];
    const initialHidden = columns.filter(
        c => c.id.toUpperCase() !== c.id && !["Audios", "project", "accum_outputs", "pad_input", "with_skip_conv", "with_residual_conv"].includes(c.Header))
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
        visibleColumns,
        state,
        preGlobalFilteredRows,
        setGlobalFilter
    } = useTable({
            columns, data,
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
    return (
        <>
            <div className={"control-panel"}>
            {/* Global Filter */}
            <GlobalFilter
                globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
            />
            <ColumnManager getToggleHideAllColumnsProps={getToggleHideAllColumnsProps}
                allColumns={allColumns}
                setColumnOrder={setColumnOrder}
                />
            <br/>
            <div style={{margin: "auto", width: "max-content"}}>Displaying {rows.length} results</div>
            </div>
            {/*<pre>{JSON.stringify(state.hiddenColumns, null, 2)}</pre>*/}
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
                                    : <>
                                        <span className={"column-title"}>{column.render('Header')}</span>
                                        {/* Add a sort direction indicator */}
                                        <span className={"column-icons"}>
                                            <i className={"fa fa-close"} onClick={() => column.toggleHidden(true)}/>
                                            <i className={"fa fa-chevron-up"}/>
                                            <i className={"fa fa-chevron-down"}/>
                                            {column.canGroupBy ? (
                                                // If the column can be grouped, let's add a toggle
                                                <i {...column.getGroupByToggleProps()}
                                                   className={"fa fa-indent"}
                                                   style={{
                                                       color: column.isGrouped ? "green" : '#6D6D6D',
                                                   }}/>
                                            ) : null}
                                        </span>
                                    </>
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
                                                // color the cell depending on what type it is given
                                                // from the useGroupBy hook
                                                {...cell.getCellProps()}
                                                className={cell.isGrouped ? "grouped-column" : ""}
                                                style={{
                                                    background: cell.isGrouped
                                                        ? '#a6ff4474'
                                                        : cell.isAggregated
                                                            ? '#ffa10045'
                                                            : cell.isPlaceholder
                                                                ? '#ff330042'
                                                                : 'white',
                                                }}
                                            >
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
                                <tr>
                                    <td colSpan={rows.length} className={"audio-container"}>
                                        {audios[row.original.id] &&
                                        audios[row.original.id].map((x, i) => {
                                            return <Waveform
                                                key={x}
                                                url={"http://localhost:5000/" + x}
                                                title={x.split("/")[4]}
                                                handleFinish={() => {
                                                    const list = audios[row.original.id];
                                                    const index = list.indexOf(x) + 1;
                                                    if (index < list.length) {
                                                        const id = list[index].split("/")[4];
                                                        const element = document.getElementById("play-" + id);
                                                        element.click()
                                                    }
                                                }}
                                            />
                                        })}
                                    </td>
                                </tr>
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
        axios.get("http://0.0.0.0:5000/experiments/").then(
            response => {
                // columns are dynamically defined so we need the set of
                // keys in all the experiments
                let columns = new Set();
                response.data.data.forEach(
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
                                `(${row.original.audios.length.toString()})`
                                : null}
                        </span>
                    )
                });
                setColumns(columns);
                setData(response.data.data);
            }
        );
    }, []);
    const audios = {};
    data.forEach(exp => audios[exp.id] = exp.audios);
    const memoColumns = useMemo(() => columns, [columns]);
    const memoData = useMemo(() => data, [data]);
    // console.log(memoColumns);
    return (
        <Table columns={memoColumns} data={memoData} audios={audios}/>
    )
}