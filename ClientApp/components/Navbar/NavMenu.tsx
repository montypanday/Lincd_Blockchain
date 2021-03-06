import * as React from "react";
import { Link, NavLink } from "react-router-dom";
import { GDIcon } from "../SVGs/icon-GD";
import { BOXIcon } from "../SVGs/icon-BOX";
import { ODIcon } from "../SVGs/icon-OD";
import { DBIcon } from "../SVGs/icon-DB";
import { HELPIcon } from "../SVGs/icon-HELP";
import { LOGINIcon } from "../SVGs/icon-LOGIN";
import { HOMEIcon } from "../SVGs/icon-HOME";
import { ChainIcon } from "../SVGs/icon-Chain";

export class NavMenu extends React.Component<{}, {}> {
    constructor(props) {
        super(props);
        this.state = {
            boxSigned: false,
            googleSigned: false
        };
    }
    public render() {
        return <div className="main-nav">
            <div className="navbar navbar-inverse navbar-fixed-top">
                <div className="navbar-header">
                    <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                    <Link className="navbar-brand" to={"/"}><ChainIcon/>DocChain</Link>
                </div>

                <div className="navbar-collapse collapse">
                    <ul className="nav navbar-nav">
                        <li>
                            <NavLink to={"/"} exact activeClassName="active">
                                <HOMEIcon/> Home
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={"/explorer"} activeClassName="active">
                                <BOXIcon />
                                <div className="LinkText"><div className="visible-md-block visible-lg-block">Box</div></div>
                                <div className="visible-xs-block">Box</div>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={"/driveExplorer"} activeClassName="active">
                                <GDIcon />
                                <div className="LinkText"><div className="visible-md-block visible-lg-block">Google Drive</div></div>
                                <div className="visible-xs-block">Google Drive</div>
                            </NavLink>

                        </li>
                        {/*<li>
                            <NavLink to={"/#"} activeClassName="active">
                                <ODIcon />
                                <div className="LinkText"><div className="visible-md-block visible-lg-block">OneDrive</div></div>
                                <div className="visible-xs-block">OneDrive</div>
                            </NavLink>

                        </li>
                        <li>
                            <NavLink to={"/#"} activeClassName="active">
                                <DBIcon />
                                <div className="LinkText"><div className="visible-md-block visible-lg-block">Dropbox</div></div>
                                <div className="visible-xs-block">Dropbox</div>
                            </NavLink>

                        </li>
                        */}

                        <li>
                            <NavLink to={"/faq"} activeClassName="active">
                                <HELPIcon/> FAQ
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={"/Login"} activeClassName="active">
                                <LOGINIcon /> Account
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </div>;
    }
}



