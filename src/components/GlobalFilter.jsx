// simple filter
import React from "react";
import {useAsyncDebounce} from "react-table";

export function GlobalFilter({
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