﻿import * as React from "react";
import { render } from "react-dom";
import { formatSizeUnits } from "./FormatSize";
import { CheckIfTracked } from "../../api/Chain_Utilities";
import { ContextMenu } from "../Explorers/contextmenu";
import { CertDrawer } from "../Explorers/CertDrawer";
import { MapHistory } from "../../api/Chain_Utilities";

export interface AppProps {
    type: string;
    filename: string;
    size: string;
    lastModified: string;
    navHandler: any;
    id: any;
    hash: any;
    mimeType: any;
    deleteHandler: any;
    downloadHandler: any;
    renameHandler: any;
    shareLinkHandler: any;
    platform: string;
    secure: string;
    historyModalHandler: any;
    putHandler: any;
}

export interface AppState {
    isTracked: any;
}

export class Row extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            isTracked: true,
        }
    }

    getFileExtension(filename) {
        try {
            return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
        } catch {
            return "";
        }
    }

    getIconClass(extension, mimeType) {
        const FormatDictinary = {
            "txt": "text-o",
            "doc": "word-o",
            "docs": "word-o",
            "docx": "word-o",
            "gdoc": "word-o",
            "pdf": "pdf-o",
            "xls": "excel-o",
            "xlsx": "excel-o",
            "gsheets": "excel-o",
            "ppt": "powerpoint-o",
            "pptx": "powerpoint-o",
            "gslides": "powerpoint-o",
            "m4a": "audio-o",
            "mp4": "audio-o",
            "mp3": "audio-o",
            "png": "image-o",
            "PNG": "image-o",
            "JPG": "image-o",
            "jpg": "image-o",
            "JPEG": "image-o",
            "jpeg": "image-o",
            "gif": "image-o",
            "GIF": "image-o",
            "cs": "code-o",
            "js": "code-o",
            "css": "code-o",
            "php": "code-o",
            "sql": "code-o",
            "config": "code-o",
            "html": "code-o",
            "xml": "code-o",
            "zip": "archive-o",
            "flv": "video-o"
        };

        const GoogleFormatDictionary = {
            "application/vnd.google-apps.spreadsheet": "fa fa-2x fa-file-excel-o",
            "application/vnd.google-apps.document": "fa fa-2x fa-file-word-o",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "fa fa-2x fa-file-word-o",
            "application/vnd.google-apps.presentation": "fa fa-2x fa-file-powerpoint-o",
            "application/vnd.google-apps.drawing": "fa fa-2x fa-picture-o",
            "application/vnd.google-apps.map": "fa fa-2x fa-map-marker",
            "application/vnd.google-apps.form": "fa fa-2x fa-wpforms",
            "application/vnd.google-apps.site": "fa fa-2x fa-html5",
            "image/jpeg": "fa fa-2x fa-file-picture-o"
        };

        if (FormatDictinary[extension]) {
            return "fa fa-2x fa-file-" + FormatDictinary[extension];
        }
        if (extension === "" && mimeType === "") {
            return "fa fa-folder fa-2x";
        }
        if (GoogleFormatDictionary[mimeType]) {
            return GoogleFormatDictionary[mimeType];
        }
        if (mimeType == "application/vnd.google-apps.folder") {
            return "fa fa-folder fa-2x";
        }
        return "fa fa-2x fa-file-o";
    }

    doSomething(e) {
        console.log("something");

        var fileActionJson = {
            fileAction: {
                "FileID": "11111111",
                "FileHash": "256bit hexadecimal number",
                "StoragePlatform": "Docchain Development",
                "UserID": "22222222",
                "ActionType": "Test Action"
            }
        };

        fetch("https://localhost:44374/api/FileAction/LogAction", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(fileActionJson)
        });
    }

    componentDidMount() {
        //MapHistory(this.props.id, this.props.platform);
    }

    shouldComponentUpdate(nextProps) {
        const a = this.props.type !== nextProps.type;
        const b = this.props.filename !== nextProps.filename;
        const c = this.props.size !== nextProps.size;
        const d = this.props.lastModified !== nextProps.lastModified;
        const e = this.props.secure !== nextProps.secure;
        return (a || b || c || d || e);
    }

    //This method is method is no longer being used, was created to query the database to check whether or not a file was being tracked, and set the row state accordingly.
    //Keeping it here in case we need similar functionality in the future.
    checkIfTracked() {
        var isTracked = CheckIfTracked(this.props.id, this.props.platform)
            .then(body => {
                this.setState({ isTracked: body });
                console.log("Row tracked: " + this.state.isTracked);
            })
            .catch(error => {
                console.log(error);
            });
        this.setState({ isTracked: isTracked });
    }

    render() {
        var a = this.getFileExtension(this.props.filename);
        var iconClass = this.getIconClass(a, this.props.mimeType);
        var icon;
        icon = <span className={iconClass} style={{ verticalAlign: "middle", float: "left", fontSize: "1.5em" }}></span>;
        return (
            <tr id={this.props.id}>

                <td className="col-xs-6 " id={this.props.id}>
                    <a onClick={this.props.navHandler} style={{ cursor: "pointer" }}>
                        {icon}
                        <p style={{ float: "left", paddingLeft: "15px" }}>{this.props.filename}</p>
                    </a>
                </td>
                <td className="col-xs-1 ">
                    {this.props.id != "sharedWithMe" &&
                        <div className="dropdown">
                            <button className="btn btn-default btn-line dropdown-toggle action-btn" style={{ verticalAlign: "middle", zIndex: 0 }} type="button" data-toggle="dropdown">...
                            </button>
                            <ul className="dropdown-menu">

                                {this.props.type != "folder" && <li><a onClick={this.props.navHandler} ><i className="fa fa-eye dropDownIcon" aria-hidden="true"></i>Preview</a></li>}
                                {this.props.type != "folder" && <li><a onClick={this.props.downloadHandler}><i className="fa fa-download dropDownIcon" aria-hidden="true"></i>Download</a></li>}
                                {this.props.id != "sharedWithMe" &&
                                    <li>
                                        <a onClick={this.props.deleteHandler}><i className="fa fa-trash-o dropDownIcon" aria-hidden="true"></i>Delete</a>
                                    </li>
                                }
                                <li>
                                    <a onClick={this.props.renameHandler}><i className="fa fa-pencil-square-o dropDownIcon" aria-hidden="true"></i>Rename</a>
                                </li>
                                <li>
                                    <a onClick={this.props.shareLinkHandler}><i className="fa fa-share dropDownIcon" aria-hidden="true"></i>Share</a>
                                </li>
                                {this.props.type != "folder" &&
                                    <li className="divider">
                                    </li>
                                }
                            {this.props.type != "folder" && <li><a onClick={this.props.historyModalHandler} > <i className="fa fa-check dropDownIcon" aria-hidden="true"></i>Check with Blockchain</a></li>}
                            {this.props.type != "folder" && <li><a onClick={this.props.putHandler}> <i className="fa fa-link dropDownIcon" aria-hidden="true"></i> Embed Into Blockchain</a></li>}
                            </ul>
                        </div>}
                    <div className="contextmenu dropdown" id={"contextMenu" + this.props.id}>
                        <ul className="dropdown-menu">
                            {this.props.type != "folder" &&
                                <li>
                                    <a onClick={this.props.downloadHandler}><i className="fa fa-download dropDownIcon" aria-hidden="true"></i>Download</a>
                                </li>
                            }
                            {this.props.type != "folder" &&
                                <li>
                                    <a onClick={this.props.navHandler} ><i className="fa fa-eye dropDownIcon" aria-hidden="true"></i>Preview</a>
                                </li>
                            }

                            {this.props.id != "sharedWithMe" &&
                                <li> <a onClick={this.props.deleteHandler}><i className="fa fa-trash-o dropDownIcon" aria-hidden="true"></i>Delete</a>
                                </li>}
                            <li>
                                <a onClick={this.props.renameHandler}><i className="fa fa-pencil-square-o dropDownIcon" aria-hidden="true"></i>Rename
                                </a>
                            </li>
                            <li><a onClick={this.props.shareLinkHandler}><i className="fa fa-share dropDownIcon" aria-hidden="true"></i>Share</a></li>

                            {this.props.type != "folder" && <li className="divider"></li>}
                            {this.props.type != "folder" && <li><a onClick={this.props.historyModalHandler}><i className="fa fa-check dropDownIcon" aria-hidden="true"></i>Check Against Blockchain</a></li>}
                        </ul>
                    </div>
                    {/*
                        this.props.type != "folder" &&
                        <CertDrawer />
                    */}
                </td>
                <td className="col-xs-1 " style={{ verticalAlign: "middle" }}>{formatSizeUnits(this.props.size)}</td>
                <td className="col-xs-2 " style={{ verticalAlign: "middle" }}>{this.props.lastModified}</td>
            </tr>
        );
    }
}

