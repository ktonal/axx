import React from "react";
import * as PropTypes from "prop-types";

class Modal extends React.Component {
    close(e) {
        e.preventDefault();
        const {onClose} = this.props;
        if (onClose) {
            onClose();
        }
    }

    render() {
        const {isOpen, children} = this.props;
        if (isOpen === false) return null;

        return (
            <>
                <div className={"info-modal"}>{children}</div>
                <div className="bg" onClick={e => this.close(e)}/>
            </>
        );
    }
}

export function InfoModal(props) {
    return <Modal isOpen={props.open} onClose={props.onClose}>
        <h4>What is this?</h4>
        <p>This is a prototype for a web-based visualization tool.</p>
        <p><code>aXX</code> allows you to explore the relationship between the parameters of Machine
            Learning models that generate sound and the sounds they actually generate.</p>
        <h4>How does it work?</h4>
        <p>You can drag-and-drop the names of the columns in the list at the top to reorder the
            columns
            in the table.</p>
        <p>Click on the <i className={"fa fa-eye"}/> to toggle the columns' visibility.</p>
        <p>At the bottom of the columns' icons (in their headers), click on <i
            className={"fa fa-indent"}/> to group the rows by the distinct values of that column.
        </p>
        <p>In the "Audios" column, click on <i className={"fa fa-chevron-right"}/> to display (and
            play!) what the models generated.</p>
        <h4>Where do the sounds come from?</h4>
        <p>All the sounds & experiments shown on this page have been made by the group k-tonal
            (website
            coming soon!) with their own <a href={"https://github.com/k-tonal/mimikit"}>mimikit</a>,
            a
            python package for doing deep-learning with your own audios.</p>
    </Modal>;
}

InfoModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func
};