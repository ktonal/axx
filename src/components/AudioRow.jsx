import React from "react";
import Waveform from "./Waveform";
import axios from "axios";
import {AuthContext} from "./Auth";

export const AudioRow = React.memo(({row, colSpan, addBlob: addBlobs, removeBlob}) => {
    const [audios, setAudios] = React.useState(row.original["blobs"]);
    React.useEffect(() => setAudios(row.original["blobs"]), [row]);
    const {token} = React.useContext(AuthContext);
    const addBlobCallback = () => {
        const input = document.createElement("input");
        input.type = 'file';
        input.multiple = true;
        input.display = 'none';
        input.onchange = (e) => {
            var promises = [];
            const blobs = [];
            Array.from(e.target.files).forEach(file => {
                let formData = new FormData();
                formData.append("file", file);
                promises.push(axios.post(
                    process.env.REACT_APP_BACKEND_URL + "/bytes/",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            "Authorization": "Bearer " + token
                        }
                    }).then(res => {
                    blobs.push(res.data);
                }))
            });
            Promise.all(promises).then(() => {
                    addBlobs(row.index, blobs); // the Blob response
                    setAudios([...row.original["blobs"]]);
                })
        };
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input)
    };
    const removeBlobCallback = (index) => {
        removeBlob(row.index, index);
        setAudios([...row.original.blobs]);
    };
    const numAudios = audios.length;
    return <>
        <tr {...row.getRowProps()}>
            <td colSpan={colSpan} className={"audio-container"} align={"left"}>
                <i className={"fa fa-plus-circle"}
                   style={{fontSize: "xx-large",}}
                   onClick={addBlobCallback}/>
                <div>
                    {audios ?
                        audios.map((audioBlob, i) => {
                            return (<Waveform
                                key={i}
                                url={process.env.REACT_APP_BACKEND_URL + "/bytes/" + audioBlob.path + "?bucket=" + audioBlob.bucket}
                                path={audioBlob.path}
                                title={audioBlob.name}
                                bucket={audioBlob.bucket}
                                width={`${Math.floor(100 / Math.min(5, numAudios)) - 2}%`}
                                handleFinish={() => {
                                    const index = audios.indexOf(audioBlob) + 1;
                                    if (index < audios.length) {
                                        const id = audios[index].name;
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