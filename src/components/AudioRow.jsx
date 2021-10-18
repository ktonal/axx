import React from "react";
import Waveform from "./Waveform";

export const AudioRow = React.memo(({row, colSpan}) => {
    const [audiosURLs, setAudiosUrls] = React.useState(row.original["audios"]);
    React.useEffect(() => setAudiosUrls(row.original["audios"]), [row]);
    return <tr {...row.getRowProps()}>
        <td colSpan={colSpan} className={"audio-container"}>
            {audiosURLs ?
                audiosURLs.map((x, i) => {
                    const splitedPath = x.split("/");
                    return <Waveform
                        key={x}
                        url={process.env.REACT_APP_BACKEND_URL+"/bytes/" + x}
                        path={x}
                        title={splitedPath[splitedPath.length - 1]}
                        handleFinish={() => {
                            const list = audiosURLs;
                            const index = list.indexOf(x) + 1;
                            if (index < list.length) {
                                const id = list[index].split("/")[splitedPath.length - 1];
                                const element = document.getElementById("play-" + id);
                                element.click()
                            }
                        }}
                    />
                })
                : <span style={{fontSize: "x-large"}}>No audio...</span>}
        </td>
    </tr>
});