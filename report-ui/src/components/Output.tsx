import React from 'react';

interface IOutput {
    source: string
}

// console.log(require())

class Output extends React.Component<IOutput> {
    render() {
        const html = require("/tmp/neptune-server/MOD-32/data.json");
        const audioSource = {__html: html};
        return (
            <div dangerouslySetInnerHTML={audioSource}/>
        )
    }
}

export default Output;