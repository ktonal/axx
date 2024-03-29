import React, {useEffect, useRef, useState} from "react";
import WaveSurfer from "wavesurfer.js";
import axios from "axios";
import {AuthContext} from "./Auth";

const waveSurferOptions = ref => ({
    container: ref,
    waveColor: "lightgray",
    progressColor: "#6996e6",
    cursorColor: "#6996e6",
    barWidth: 1,
    barHeight: 4,
    // maxCanvasWidth: null,
    responsive: true,
    height: 50,
    // Use the PeakCache to improve rendering speed of large waveforms.
    partialRender: false
});

export default function Waveform({url, title, path, bucket, width, handleFinish, remove: removeFromList}) {
    const {token} = React.useContext(AuthContext);
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
                value: "Bearer " + token
            }, {
                key: "Cache-Control",
                value: "public, max-age=604800, immutable"
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
    }, [url, handleFinish, token]);

    const handlePlayPause = () => {
        setPlay(!playing);
        wavesurfer.current.playPause();
    };

    return (
        // the container
        <div className={"waveform-element"}
             style={{minWidth: width}}>
            {/* the header */}
            <div className={"waveform-header"}>
                <i className={"play-button fa " + (playing ? "fa-pause-circle" : "fa-play-circle-o")}
                   id={`play-${title}`}
                   onClick={handlePlayPause}>
                </i>
                <i className={"download-button fa fa-download"}
                   style={{padding: "0 6px", fontSize: "x-large", color: "#a0d78f"}}
                   onClick={() => {
                       axios.get(url,
                           {
                               headers: {
                                   "Authorization": "Bearer " + token
                               },
                               responseType: "arraybuffer"
                           }).then(res => {
                           const url = window.URL.createObjectURL(new Blob([res.data]));
                           const link = document.createElement('a');
                           link.href = url;
                           link.setAttribute('download', path); //or any other extension
                           document.body.appendChild(link);
                           link.click();
                           // console.log(res)
                       })
                   }}
                />
                <a href={`https://console.cloud.google.com/storage/browser/_details/${bucket}/${path};tab=live_object?authuser=1`}>
                    <i className={"link-button fa fa-link"}
                   style={{fontSize: "x-large", color: "#d1d7ac"}}
                   />
                </a>
                <i className={"trash-button fa fa-trash"}
                   style={{padding: "0 6px", fontSize: "x-large", color: "#d78377"}}
                   onClick={() => {
                       if (window.confirm("Are you sure you want to delete this?")) {
                           axios.delete(url, {
                               headers: {
                                   "Authorization": "Bearer " + token
                               }
                           }).then(() => removeFromList())
                       }
                   }}
                />
                <span className={"waveform-title"}>{"  " + title}</span>
                <i className={"remove-button fa fa-times-circle"}
                   style={{margin: "0 4px 0 auto", fontSize: "x-large"}}
                   onClick={removeFromList}
                />
            </div>
            {/* the waveform (ui kit must be turned off for it to display correctly) */}
            <div className={"waveform"}
                 ref={waveformRef}>
            </div>
        </div>
    );
}