import React from "react";
import axios from 'axios';

// Show the projects + show if they are locally downloaded
// if they aren't download them
// click on them to explore them

type ProjectProps = {
    name: string;
    onDisk: boolean;
    experiments: Array<string>;
    onChange: Function;
};

type ProjectState = {
    active: boolean;
    onDisk: boolean;
    isLoading: boolean;
}


class ProjectCard extends React.Component<ProjectProps, ProjectState> {

    constructor(props: any) {
        super(props);
        this.state = {
            active: false,
            onDisk: this.props.onDisk,
            isLoading: false,
        }
        this.downloadProject = this.downloadProject.bind(this);
    }

    downloadProject() {
        let downloaded: number = 0;
        this.setState({isLoading: true, onDisk: false});
        this.props.experiments.forEach(exp => {
            axios.get("http://localhost:5000/experiment-data/" + this.props.name + "/" + exp).then(response => {
                    downloaded = downloaded + 1;
                    if (downloaded === this.props.experiments.length) {
                        this.setState({onDisk: true, isLoading: false});
                    }
                }
            )
        })
    }

    render() {
        const experiments = this.props.experiments.map((exp) => {
            return (
                <li key={exp}>
                    <span onClick={() => this.props.onChange(this.props.name, exp)}>
                        {exp}
                    </span>
                </li>)
        })
        return (
            <div className={"uk-card uk-card-default-uk-card-body"}>
                <ul className={"uk-nav uk-nav-default uk-nav-parent-icon"}>
                    <li className={"uk-active uk-parent"}>
                    <span
                        onClick={() => this.setState({active: !this.state.active})}>
                        {this.props.name.split("/")[1]}
                        <span className={"uk-icon project-status"}
                                  onClick={this.downloadProject}
                                  data-uk-icon={"download"}/>
                        {this.state.isLoading ?
                            <div data-uk-spinner={"ratio: .5"} className={"project-status"}/>
                            : null}
                        {this.state.onDisk ?
                            <span className={"uk-icon project-status"}
                                  data-uk-icon={"check"}/>
                            : null}

                    </span>
                        <ul className={"uk-nav-sub"}>
                            {this.state.active && experiments}
                        </ul>
                    </li>
                </ul>
            </div>
        )
    };
}

type ProjectsState = {
    projects: Array<ProjectProps>;
}

export default class Projects extends React.Component<{ onChange: Function }, ProjectsState> {
    constructor(props: any) {
        super(props);
        this.state = {projects: []}
    }

    componentDidMount() {
        axios.get("http://localhost:5000/projects").then(response =>
            this.setState({
                projects: [...response.data]
            })
        )
    }

    render() {
        const projects: Array<React.ReactNode> = [];
        this.state.projects.forEach(project =>
            projects.push(<ProjectCard key={project.name}
                                       name={project.name}
                                       onDisk={project.onDisk}
                                       experiments={project.experiments}
                                       onChange={this.props.onChange}/>))
        return (
            <React.Fragment>
                <nav className={"uk-card uk-card-default uk-card-body sidebar"}>
                    <h3 className={"uk-card-title"}>
                        Projects
                    </h3>
                    {projects}
                </nav>
            </React.Fragment>
        )
    }

}