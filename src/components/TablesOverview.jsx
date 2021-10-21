import React from "react";
import {AuthContext} from "./Auth";
import axios from "axios";
import * as PropTypes from "prop-types";


export default function TablesOverview(props) {
    const {token} = React.useContext(AuthContext);
    const [tables, setTables] = React.useState([]);
    const setCurrentTable = props.setCurrentTable;

    React.useEffect(() => {
        axios.get(process.env.REACT_APP_BACKEND_URL + "/table/",
            {"headers": {"Authorization": "Bearer " + token}})
            .then(res => {
                setTables(res.data)
            })
    }, [token, setTables]);
    return (
        <div>
            {tables.map((name, i) =>
                <ul key={i} onClick={() => setCurrentTable(name)}>{name}</ul>
            )}
        </div>
    )
}

TablesOverview.propTypes = {
    setCurrentTable: PropTypes.func,
};