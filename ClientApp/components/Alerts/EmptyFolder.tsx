﻿import * as React from "react";
import { EmptyFolderIcon } from '../SVGs/icon-EmptyFolder';
require('./ErrorSplash.css');

export default class EmptyFolder extends React.Component {

    public render() {
        return <div className="splash">
            <EmptyFolderIcon />
            <p>This folder contains no files.</p>
        </div>
    }
}