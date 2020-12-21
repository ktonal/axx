import React from 'react';

interface IOutput {
    source: string
}

// console.log(require())

class Output extends React.Component<IOutput> {
    render() {
        const html = require("../data/babys/B-1/audio/gen_0_0.wav.html");
        const audioSource = {__html: html};
        return (
            <div dangerouslySetInnerHTML={audioSource}/>
        )
    }
}

export default Output;