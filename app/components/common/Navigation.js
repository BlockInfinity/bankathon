import React, { Component } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link, Location } from 'react-router';

class Navigation extends Component {

    componentDidMount() {
        const { menu } = this.refs;
        $(menu).metisMenu();
    }

    activeRoute(routeName) {
        return this.props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
    }

    secondLevelActive(routeName) {
        return this.props.location.pathname.indexOf(routeName) > -1 ? "nav nav-second-level collapse in" : "nav nav-second-level collapse";
    }

    render() {
        return (
            <nav className="navbar-default navbar-static-side" role="navigation">
                <ul className="nav metismenu" id="side-menu" ref="menu">
                   <li className="nav-header">
                        <div className="dropdown profile-element"> <span>
                                <img alt="image" className="img-circle" src="img/profile_small.jpg" />
                                 </span>
                            <a data-toggle="dropdown" className="dropdown-toggle" href="#">
                                <span className="clear"> <span className="block m-t-xs"> <strong className="font-bold">David Williams</strong>
                                 </span> <span className="text-muted text-xs block">Investor <b className="caret"></b></span> </span> </a>
                            <ul className="dropdown-menu animated fadeInRight m-t-xs">
                                <li><Link to="/dashboard">Dashboard</Link></li>
                                <li><Link to="/myEnergySystems">My Energy Systems</Link></li>
                                <li><a href="profile.html">Profile</a></li>
                            </ul>
                        </div>
                        <div className="logo-element">
                            IN+
                        </div>
                    </li>
                    <li className={this.activeRoute("/dashboard")}>
                        <Link to="/dashboard"><i className="fa fa-th-large"></i> <span className="nav-label">Dashboard</span></Link>
                    </li>
                    <li className={this.activeRoute("/myEnergySystems")}>
                        <Link to="/myEnergySystems"><i className="fa fa-th-large"></i> <span className="nav-label">My Energy Systems</span></Link>
                    </li>
                    <li className={this.activeRoute("/energySystemsList")}>
                        <Link to="/energySystemsList"><i className="fa fa-th-large"></i> <span className="nav-label">Energy Systems List</span></Link>
                    </li>
                    <li className={this.activeRoute("/energySystemsProfile")}>
                        <Link to="/energySystemsProfile"><i className="fa fa-th-large"></i> <span className="nav-label">Energy Systems Profile</span></Link>
                    </li>
                    <li className={this.activeRoute("/energySystemsNew")}>
                        <Link to="/energySystemsNew"><i className="fa fa-th-large"></i> <span className="nav-label">Energy Systems New</span></Link>
                    </li>
                    <li className={this.activeRoute("/main")}>
                        <Link to="/main"><i className="fa fa-th-large"></i> <span className="nav-label">Main view</span></Link>
                    </li>
                </ul>
            </nav>
        )
    }
}

export default Navigation
