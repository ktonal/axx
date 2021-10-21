import React from "react";
import Waveform from "./Waveform";

export const AudioRow = React.memo(({row, colSpan, addBlob, removeBlob}) => {
    const [audiosURLs, setAudiosUrls] = React.useState(row.original["audios"]);
    React.useEffect(() => setAudiosUrls(row.original["audios"]), [row]);
    const addBlobCallback = () => {
        addBlob(row.index, "123/com");
        setAudiosUrls([...row.original.audios]);
    };
    const removeBlobCallback = (index) => {
        console.log("REMOVE", index);
        removeBlob(row.index, index);
        setAudiosUrls([...row.original.audios]);
    };
    return <>
        <tr {...row.getRowProps()}>
            <td colSpan={colSpan} className={"audio-container"} align={"left"}>
                <i className={"fa fa-plus-circle"}
                   style={{fontSize: "xx-large", }}
                   onClick={addBlobCallback}/>
                <div>
                    {audiosURLs ?
                        audiosURLs.map((x, i) => {
                            const splitedPath = x.split("/");
                            return (<Waveform
                                key={i}
                                url={process.env.REACT_APP_BACKEND_URL + "/bytes/" + x}
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
                                remove={() => removeBlobCallback(i)}
                            />)
                        })
                        : <span style={{fontSize: "x-large"}}>No audio...</span>}
                </div>
            </td>
        </tr>
    </>
});