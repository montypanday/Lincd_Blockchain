﻿import * as React from "react";
import { GDIcon } from "../SVGs/icon-GD";
import { BOXIcon } from "../SVGs/icon-BOX";
import { ODIcon } from "../SVGs/icon-OD";
import { DBIcon } from "../SVGs/icon-DB";

interface LoginState {
    loggedIn: boolean;
}

export class Login extends React.Component<{}, LoginState> {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false
        };
    }
    render() {
            return (<div className="body">
                <div className="grid-container">
                    <div className="select">
                        <p> Select your cloud storage provider </p>
                    </div>
                    <a href="https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/drive&client_id=900082198060-kdvsjc3ecm82gn48dl9083cg0gihggm1.apps.googleusercontent.com&redirect_uri=https://docchain.azurewebsites.net/api/Google/Authenticate&response_type=code&access_type=offline&include_granted_scopes=true&state=state_parameter_passthrough_value&prompt=consent">
                        <div className="googledrive">
                            <GDIcon/>
                            <p>Google Drive</p>
                        </div>
                    </a>
                    <a href="https://account.box.com/api/oauth2/authorize?response_type=code&client_id=3syx1zpgoraznjex526u78ozutwvgeby&state=security_token%3DKnhMJatFipTAnM0nHlZA">
                        <div className="box">
                            <BOXIcon/>
                            <p>Box</p>
                        </div>
                    </a>
                </div>
            </div>
            );
        }
    }
