import React from "react";
import "./App.scss";

import TablesOverview from './components/TablesOverview';
import ExperimentsTable from "./components/ExperimentsTable";
import {AuthContext, Login} from "./components/Auth";


export default function App() {
    const [token, setToken] = React.useState(false);
    const [currentTable, setCurrentTable] = React.useState(null);
    return (
        <div className={"App"}>
            <AuthContext.Provider value={{token: token, setToken: setToken}}>

                <div className={"header"}>
                    <h3 id={"logo"}>
                        {"< a u d i o - e X p e r i m e n t - e X p l o r e r >"}
                    </h3>
                    <AuthContext.Consumer>
                        {({setToken}) => (
                            <Login setToken={setToken}/>
                        )}
                    </AuthContext.Consumer>
                    {token ?
                        <TablesOverview setCurrentTable={setCurrentTable}/>
                        : null}
                </div>
                {(token && currentTable) ?
                    <ExperimentsTable table={currentTable}/>
                    : null}
            </AuthContext.Provider>
        </div>
    );
}
