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
import Waveform from "./Waveform";

// Define a default UI for filtering
function GlobalFilter({
                          preGlobalFilteredRows,
                          globalFilter,
                          setGlobalFilter,
                      }) {
    const count = preGlobalFilteredRows.length;
    const [value, setValue] = React.useState(globalFilter);
    const onChange = useAsyncDebounce(value => {
        setGlobalFilter(value || undefined)
    }, 200);

    return (
        <span>
            <input
                value={value || ""}
                onChange={e => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder={`Search : ...`}
                style={{
                    fontSize: '1.1rem',
                    border: '0',
                }}
            />
        </span>
    )
}

const Table = ({columns, data, audios}) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        allColumns,
        getToggleHideAllColumnsProps,
        state,
        preGlobalFilteredRows,
        setGlobalFilter
    } = useTable({columns, data},
        useColumnOrder,
        useGlobalFilter,
        useGroupBy,
        useSortBy,
        useExpanded,
    );

    // by default, we order columns by the number of distinct elements they have
    // and cap their numbers to 12
    // const sortedColumns = {};
    // find distinct elements
    // allColumns.forEach(column => {
    //     let id = column.id;
    //     let values = data.map(exp => exp[id]);
    //     sortedColumns[id] = Array.from([...new Set(values)])
    // });
    return (
        <>

            {/* Component for selecting columns */}
            <div className={"table-options"}>
                <div className={"column-toggle"}>
                    <label>
                        <input type="checkbox" {...getToggleHideAllColumnsProps()} />{' '}
                        {"All columns"}
                    </label>
                </div>
                {allColumns.map(column => (
                    <div key={column.id} className={"column-toggle"}>
                        <label>
                            <input type="checkbox" {...column.getToggleHiddenProps()} />{' '}
                            {column.Header}
                        </label>
                    </div>
                ))}
                {" "}
            </div>
            <br/>
            {/* Global Filter */}
            <GlobalFilter
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
            />
            <br/>
            {/*<pre>{JSON.stringify(visibleColumns, null, 2)}</pre>*/}
            <div>Displaying {rows.length} results</div>
            {/* The Table */}
            <br/>
            <table {...getTableProps()}>
                <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps(column.getSortByToggleProps())}
                                className={column.isGrouped ? "grouped-column" : ""}>
                                {column.id === "expander" ?
                                    <span className={"column-title"}
                                          style={{top: "-2px"}}>{column.render('Header')}</span>
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
                                                       color: column.isGrouped ? "green" : 'black',
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
                                                // For educational purposes, let's color the
                                                // cell depending on what type it is given
                                                // from the useGroupBy hook
                                                {...cell.getCellProps()}
                                                className={cell.isGrouped ? "grouped-column" : ""}
                                                style={{
                                                    background: cell.isGrouped
                                                        ? '#0aff0082'
                                                        : cell.isAggregated
                                                            ? '#ffa50078'
                                                            : cell.isPlaceholder
                                                                ? '#ff000042'
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
                                    <td colSpan={rows.length} style={{"borderRight": "0"}}>
                                        {audios[row.original.id].map((x, i) => {
                                            return <Waveform
                                                key={x}
                                                url={"http://localhost:5000/" + x}
                                                title={x.split("/")[4]}
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
                    return {Header: name, accessor: name}
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
                                : ""}
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
    return (
        <Table columns={memoColumns} data={memoData} audios={audios}/>
    )
}