import React, {useEffect, useState} from "react";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";

export function ColumnManager({getToggleHideAllColumnsProps, allColumns, setColumnOrder}) {
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