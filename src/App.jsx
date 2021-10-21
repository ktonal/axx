import React from "react";
import "./App.scss";

import TablesOverview from './components/TablesOverview';
import ExperimentsTable from "./components/ExperimentsTable";
import {AuthContext, Login} from "./components/Auth";
import {InfoModal} from "./components/InfoModal";


export default function App() {
    const [token, setToken] = React.useState(false);
    const [currentTable, setCurrentTable] = React.useState(null);
    const [withInfos, setInfos] = React.useState(false);
    return (
        <div className={"App"}>
            <AuthContext.Provider value={{token: token, setToken: setToken}}>

                <div className={"header"}>
                    <h3 id={"logo"}>
                        {"< a u d i o - e X p e r i m e n t - e X p l o r e r >"}
                    </h3>
                    <i className={"fa fa-info-circle"}
                       onClick={() => setInfos(true)}>
                    </i>
                    {withInfos ?
                        <InfoModal open={withInfos} onClose={() => setInfos(false)}/>
                        : null}
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
