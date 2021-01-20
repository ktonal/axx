import React from "react";
import "./App.css";

import ExperimentsTable from "./components/ExperimentsTable";

export default class App extends React.Component<{}, { projectName: string, id: string }> {
    constructor(props: any) {
        super(props);
        this.state = {
            projectName: "",
            id: "",
        }
        this.onExperimentClick = this.onExperimentClick.bind(this);
    }

    onExperimentClick(proj: string, id: string) {
        this.setState({projectName: proj.split("/")[1], id: id})
    }

    render() {
        const name = this.state.projectName;
        const id = this.state.id;
        return (
            <div className={"App"}>
                <div>
                    <h3 id={"logo"}>
                        {"< a u d i o - e X p e r i m e n t - e X p l o r e r >"}
                    </h3>
                </div>
                <div>
                    <ExperimentsTable />
                </div>
            </div>
        );
    }
}
/* - experiment header : ID, link to neptune, tags (= example's labels),( description,) losses, properties
* - hparams tree (data, model, optim)
* - list of available checkpoints
* - POST : tag, description, note / comment,
* - DELETE : audio, checkpoints
* - */