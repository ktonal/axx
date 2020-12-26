import React, {useEffect, useRef, useState} from "react";
import WaveSurfer from "wavesurfer.js";

import "./Waveform.css";


const waveSurferOptions = ref => ({
    container: ref,
    waveColor: "lightgray",
    progressColor: "#2682b4",
    cursorColor: "#2682b4",
    barWidth: 1,
    barHeight: 3,
    maxCanvasWidth: 2000,
    responsive: true,
    height: 38,
    // Use the PeakCache to improve rendering speed of large waveforms.
    partialRender: false
});

export default function Waveform({url, title}) {
    const waveformRef = useRef(null);
    const wavesurfer = useRef(null);
    const [playing, setPlay] = useState(false);

    // create new WaveSurfer instance
    // On component mount and when url changes
    useEffect(() => {
        setPlay(false);

        const options = waveSurferOptions(waveformRef.current);
        wavesurfer.current = WaveSurfer.create(options);

        wavesurfer.current.load(url);

        wavesurfer.current.on("ready", function () {
            if (wavesurfer.current) {
                wavesurfer.current.setVolume(0.5);
            }
        });
        // Removes events, elements and disconnects Web Audio nodes.
        // when component unmount
        return () => wavesurfer.current.destroy();
    }, [url]);

    const handlePlayPause = () => {
        setPlay(!playing);
        wavesurfer.current.playPause();
    };

    return (
        // the container
        <div className={"audio-element"}>
            {/* the header */}
            <div className={"waveform-header"}>
                <p className={"waveform-title"}>
                    <button className={"uk-button play-button"}
                            data-uk-icon={"play-circle"}
                            onClick={handlePlayPause}>
                     </button>
                    {"  " + title}
                </p>
            </div>
            {/* the waveform (ui kit must be turned off for it to display correctly) */}
            <div className={"no-uk waveform"}
                 ref={waveformRef}>
            </div>
        </div>
    );
}