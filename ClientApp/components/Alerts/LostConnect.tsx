﻿import * as React from "react";
import { LostConnIcon } from "../SVGs/icon-LostConn";

export default class LostConnect extends React.Component {

    public render() {
        return <div className="splash">
            <LostConnIcon />
            <p>Connection has been lost. </p>
        </div>;
    }
}