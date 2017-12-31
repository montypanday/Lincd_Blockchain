﻿import * as React from 'react';
import { render } from 'react-dom';
import { LoadingGif } from '../components/loadingGif';
import { SearchBar } from '../components/SearchBar';
import { Row } from '../components/Table/Row';
import { Link, NavLink, Redirect } from "react-router-dom";
import { BreadCrumb } from '../components/breadCrumb';
import { ContextMenu } from '../components/ContextMenu';
import { formatSizeUnits } from '../api/Helpers/FormatSize';
import FilePreviewModal from '../components/Modals/FilePreviewModal';
import TableHeading from '../components/Table/TableHeading';
import { GRoot } from '../api/Google/GRoot';
import { GSearch } from '../api/Google/GSearch';
import { GNavigateIntoFolder } from '../api/Google/GNavigateIntoFolder';
import ButtonToolBar from '../components/Table/ButtonToolbar';
import NewFolderModal from '../components/Modals/NewFolderModal';
import { GCreateNewFolder } from '../api/Google/GCreateNewFolder';
import DeleteModal from '../components/Modals/DeleteModal';
import { ToastContainer, toast } from 'react-toastify';
import { css } from 'glamor';
import { GDelete } from '../api/Google/GDelete';
import { Upload } from '../api/Google/Upload';
import EmptyFolder from '../components/Alerts/EmptyFolder';
require('../css/ContextMenu.css');

export class DriveExplorer extends React.Component<{}, {}> {

    constructor(props) {
        super(props);
        this.performSearch = this.performSearch.bind(this);
        this.navigate = this.navigate.bind(this);
        this.closePreviewModal = this.closePreviewModal.bind(this);
        this.navigateOut = this.navigateOut.bind(this);
        this.searchInFolder = this.searchInFolder.bind(this);
        this.NewFolderHandler = this.NewFolderHandler.bind(this);
        this.createNewFolderHandler = this.createNewFolderHandler.bind(this);
        this.showDeleteModal = this.showDeleteModal.bind(this);
        this.closeDeleteModal = this.closeDeleteModal.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.FileUploadHandler = this.FileUploadHandler.bind(this);
        this.state = {
            // This is space we will put the json response
            filesarray: {},
            // this is just true or false, determines whether the network request has finished, display a gif or a table
            loading: true,
            errorFound: false,
            errorMessage: "",
            PreviewUrl: "",
            PreviewFileName: "",
            query: "",
            showPreviewModal: false,
            pathCollection: [{ fileId: "root", Name: "All Files" }],
            currentFolderID: "",
            showNewFolderModal: false,
            ToBeDeletedName: "",
            ToBeDeletedID: "",
            ToBeDeletedType: "",
            showDeleteModal: false,
            FolderEmpty: false,
        }
    }

    componentDidMount() {
        GRoot().then(newData => {
            if (JSON.stringify(newData) != JSON.stringify(this.state['filesarray'])) {
                let isEmpty = false;
                if (newData.length == 0) {
                    isEmpty = true;
                }
                this.setState({ filesarray: newData, loading: false, currentFolderID: "root", FolderEmpty: isEmpty });
            }
        });
    }

    performSearch(e) {
        if (this.state["query"] !== "") {
            GSearch(this.state["query"]).then(newData => {
                if (JSON.stringify(newData) != JSON.stringify(this.state['filesarray'])) {
                    this.setState({ filesarray: newData, loading: false, pathCollection: [{ fileId: "root", Name: "All Files" }] });
                }
            });
        }

    }

    navigate(row, event) {
        // this is to navigate into folders
        var res = row.embedLink.toString();
        var str = res.replace("view", "preview");
        console.log(row);
        if (row.type === "folder") {
            console.log("Navigated into folder ->" + row);
            var newArray = this.state['pathCollection'];
            var newArray2 = JSON.parse(JSON.stringify(newArray));
            newArray2.push({ fileId: row.id, Name: row.fileName });
            this.searchInFolder(row.id, newArray2);
        }
        if (row.type === "drive#file") {
            this.setState({ PreviewUrl: row.embedLink, PreviewFileName: row.fileName, showPreviewModal: true })
        }
    }

    navigateOut(e) {
        var coll = this.state['pathCollection'];
        var index;
        for (var i = 0; i < coll.length; i++) {
            if (coll[i].fileId == e.fileId) {
                index = i;
            }
        }
        coll.length = index + 1;
        var coll2 = JSON.parse(JSON.stringify(coll));
        this.searchInFolder(e.fileId, coll2);
    }

    searchInFolder(fileID, newArray) {
        console.log("Searching in folder -> " + fileID);
        GNavigateIntoFolder(fileID).then(newData => {
            if (JSON.stringify(newData) != JSON.stringify(this.state['filesarray'])) {
                let isEmpty = false;
                if (newData.length == 0) {
                    isEmpty = true;
                }
                this.setState({ filesarray: newData, loading: false, pathCollection: newArray, currentFolderID: fileID, FolderEmpty: isEmpty });
            }
        });
    }

    closePreviewModal() {
        this.setState({ PreviewUrl: "", showPreviewModal: false, PreviewFileName: "" })
    }

    showPreview() {
        this.setState({ showingPreview: true });
    }

    getUser() {

        fetch("https://www.googleapis.com/auth/plus.me", {
            method: "GET",
            headers:
                {
                    'Authorization': 'Bearer ' + sessionStorage.getItem("google_access_token"),
                    'Accept': 'application/json'
                }
        })
            .then(response => {
                if (!response.ok) { throw response }
                console.log(response.json()['id'])
                return response.json()  //we only get here if there is no error)
            })
            .then(data => {
                console.log(data["id"]);
            })
    }

    NewFolderHandler(e) {
        console.log("Let's open a modal to make new Folder");
        this.setState({ showNewFolderModal: true });
    }

    CloseNewFolderModalHandler(e) {
        console.log("Closing New Folder Handler");
        this.setState({ showNewFolderModal: false });
    }

    createNewFolderHandler(newName) {
        console.log("Creating New Folder with name -> " + newName);
        GCreateNewFolder(this.state["currentFolderID"], newName)
            .then(newData => {
                let isEmpty = false;
                if (newData.length == 0) {
                    isEmpty = true;
                }
                this.setState({ filesarray: newData, showNewFolderModal: false, FolderEmpty: isEmpty });
                toast.success("Folder created successfully!", { hideProgressBar: true });
            });
    }

    closeDeleteModal() {
        this.setState({ showDeleteModal: false, ToBeDeletedID: "", ToBeDeletedName: "", ToBeDeletedType: "" });
    }

    deleteItem() {
        console.log("id ->" + this.state["ToBeDeletedID"]);
        console.log("type ->" + this.state["ToBeDeletedType"]);
        GDelete(this.state["ToBeDeletedID"], this.state["currentFolderID"])
            .then(newData => {
                let isEmpty = false;
                if (newData.length == 0) {
                    isEmpty = true;
                }
                this.setState({ filesarray: newData, showDeleteModal: false, ToBeDeletedID: "", ToBeDeletedName: "", ToBeDeletedType: "", FolderEmpty: isEmpty });
                toast.success("Deleted successfully!", { hideProgressBar: true });
            });
    }

    showDeleteModal(row, event) {
        this.setState({ showDeleteModal: true, ToBeDeletedID: row.id, ToBeDeletedName: row.fileName, ToBeDeletedType: row.type });
    }

    FileUploadHandler(files) {
        toast.dismiss();
        var toastIndex;
        toastIndex = toast.info("Uploading " + files.length + " files", { autoClose: false, hideProgressBar: true });
        var formData = new FormData();
        var fileList = files;
        for (var x = 0; x < fileList.length; x++) {
            console.log(fileList.item(x));
            formData.append('file' + x, fileList.item(x));
        }
        var a = ""
        if (files.length == 1) {
            a = "file";
        }
        else { a = "files"; }
        Upload(this.state["currentFolderID"], formData)
            .then(newData => {
                if (JSON.stringify(newData) != JSON.stringify(this.state['filesarray'])) {
                    let isEmpty = false;
                    if (newData.length == 0) {
                        isEmpty = true;
                    }
                    this.setState({ filesarray: newData, loading: false, FolderEmpty: isEmpty });
                    toast.update(toastIndex, {
                        autoClose: 5000, hideProgressBar: true, type: "success", render: "Successfully Uploaded " + files.length + " " + a
                    });
                }
            }).catch(function (error) {
                console.log(error);

                if (error.status == 409) {
                    toast.update(toastIndex, {
                        autoClose: false, hideProgressBar: true, type: "warning", render: "Cannot Upload File because a file with same name exists"
                    });
                }
                else {
                    alert(error);
                }
            }.bind(this));
    }

    public render() {
        if (this.state['loading'] === false) {
            // this .map function is like a foreach loop on filesarray, gives us a row object which has all the values that are related to a file object
            //rows is the variable which is being inserted into the render function at its given function see {rows} in render method.
            var rows = this.state['filesarray'].map(function (row) {
                return (<Row key={row.id} id={row.id} type={row.type} navHandler={this.navigate.bind(null, row)} iconLink={row.iconLink} mimeType={row.mimeType} filename={row.fileName} size={row.size} lastModified={row.lastModified} downloadUrl={row.downloadUrl} deleteHandler={this.showDeleteModal.bind(null, row)} ></Row>);
            }.bind(this));

            return (
                <div className="well well-lg pull-down">
                    <ToastContainer position="bottom-right" toastClassName={css({ fontFamily: "Europa, Serif", paddingLeft: "15px" })} />
                    <div style={{ float: 'right' }} className="user-details">
                        <ButtonToolBar NewFolderHandler={this.NewFolderHandler} uploadHandler={this.FileUploadHandler} ></ButtonToolBar>
                    </div>
                    <SearchBar changeHandler={e => { this.setState({ query: e.target.value }) }} searchHandler={this.performSearch}></SearchBar>
                    <BreadCrumb pathCollection={this.state['pathCollection']} navigateOutHandler={this.navigateOut.bind(this)} />
                    
                    <table className="table table-striped table-hover table-responsive well header-fixed">
                        <TableHeading />
                        {!this.state["FolderEmpty"] ?
                            < tbody >
                                {rows}
                            </tbody>
                            :
                            < tbody >
                                <EmptyFolder />
                            </tbody>
                        }
                    </table>
                    {this.state["showPreviewModal"] && <FilePreviewModal PreviewFileName={this.state["PreviewFileName"]} PreviewUrl={this.state["PreviewUrl"]} closeModal={this.closePreviewModal}></FilePreviewModal>}
                    {this.state["showNewFolderModal"] && <NewFolderModal closeHandler={this.CloseNewFolderModalHandler} createFolderHandler={this.createNewFolderHandler} ></NewFolderModal>}
                    {this.state["showDeleteModal"] && <DeleteModal fileName={this.state["ToBeDeletedName"]} id={this.state["ToBeDeletedId"]} type={this.state["ToBeDeletedType"]} closeHandler={this.closeDeleteModal} deleteActionHandler={this.deleteItem}></DeleteModal>}
                </div>
            );
        } else
            // determine if that loading is finished and render accordinglyf
            return (
                <div className="loadingGif">
                    <LoadingGif />
                    <p>Loading...</p>
                </div>
            );
    }
}