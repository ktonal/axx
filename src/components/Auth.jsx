import React from "react";
import {GoogleLogin} from "react-google-login";

const client_id = "955131018414-f46kce80kqakmpofouoief34050ni8e0.apps.googleusercontent.com";

export const AuthContext = React.createContext({token: "", setToken: () => {}});

export function Login(props) {
    const onSuccess = (res) => {
        const id_token = res.getAuthResponse().id_token;
        if (id_token){
            props.setToken(id_token);
        }
    };
    const onFailure = (res) => {
        props.setToken(false);
        console.error(res)
    };
    return (
        <div>
            <GoogleLogin clientId={client_id}
                         buttonText={"Login"}
                         onSuccess={onSuccess}
                         onFailure={onFailure}
                         cookiePolicy={"single_host_origin"}
                         isSignedIn={false}
            />
        </div>
    )
}