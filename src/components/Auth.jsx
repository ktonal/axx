import React from "react";
import { useCookies } from 'react-cookie';
import {GoogleLogin} from "react-google-login";

const client_id = "955131018414-f46kce80kqakmpofouoief34050ni8e0.apps.googleusercontent.com";


function Login(props) {
    const [cookies, setCookie] = useCookies(['user_id_token']);

    const onSuccess = (res) => {
        const id_token = res.getAuthResponse().id_token;
        setCookie('user_id_token', id_token, { path: '/'});
        if (id_token){
            props.setLoggedIn(true);
        }
        // setCookie('refresh_token', response.data.refresh_token, {path: '/', expires})
    };
    const onFailure = (res) => {
        props.setLoggedIn(false);
    };
    return (
        <div>
            <GoogleLogin clientId={client_id}
                         buttonText={"Login"}
                         onSuccess={onSuccess}
                         onFailure={onFailure}
                         cookiePolicy={"single_host_origin"}
                         isSignedIn={true}
            />
        </div>
    )
}

export default Login;