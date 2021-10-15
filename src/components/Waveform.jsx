import React, {useEffect, useRef, useState} from "react";
import WaveSurfer from "wavesurfer.js";
import {useCookies} from "react-cookie";

const waveSurferOptions = ref => ({
    container: ref,
    waveColor: "lightgray",
    progressColor: "#6996e6",
    cursorColor: "#6996e6",
    barWidth: 1,
    barHeight: 4,
    maxCanvasWidth: 200,
    responsive: true,
    height: 50,
    // Use the PeakCache to improve rendering speed of large waveforms.
    partialRender: false
});

export default function Waveform({url, title, handleFinish}) {
    const [cookies,] = useCookies(["user_id_token"]);
    const waveformRef = useRef(null);
    const wavesurfer = useRef(null);
    const [playing, setPlay] = useState(false);

    // create new WaveSurfer instance
    // On component mount and when url changes
    useEffect(() => {
        setPlay(false);

        const options = waveSurferOptions(waveformRef.current);
        options.xhr = {
            requestHeaders: [{
                key: "Authorization",
                value: "Bearer " + cookies.user_id_token
            }]
        };
        wavesurfer.current = WaveSurfer.create(options);

        wavesurfer.current.load(url);

        wavesurfer.current.on("ready", function () {
            if (wavesurfer.current) {
                wavesurfer.current.setVolume(0.5);
            }
        wavesurfer.current.on("seek", () => {
            setPlay(true);
            wavesurfer.current.play()
        });
        wavesurfer.current.on("finish", () => {
            handleFinish()
            setPlay(false)
        });
        });
        // Removes events, elements and disconnects Web Audio nodes.
        // when component unmount
        return () => wavesurfer.current.destroy();
    }, [url, handleFinish]);

    const handlePlayPause = () => {
        setPlay(!playing);
        wavesurfer.current.playPause();
    };

    return (
        // the container
        <div className={"waveform-element"}>
            {/* the header */}
            <div className={"waveform-header"}>
                <i className={"play-button fa " + (playing ? "fa-pause-circle" : "fa-play-circle-o")}
                   id={`play-${title}`}
                   onClick={handlePlayPause}>
                </i>
                <span className={"waveform-title"}>
                {"  " + title}
                </span>
            </div>
            {/* the waveform (ui kit must be turned off for it to display correctly) */}
            <div className={"waveform"}
                 ref={waveformRef}>
            </div>
        </div>
    );
}