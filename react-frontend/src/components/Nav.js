import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Menu } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import ProfilePicture from "../components/ProfilePicture";
import "./Nav.css";

class Nav extends Component {
	navCollapseQuery = window.matchMedia("(max-width: 550px)");

	constructor() {
		super();

		this.updateNavCollapse = this.updateNavCollapse.bind(this);
		this.navToogle = this.navToogle.bind(this);

		if (this.navCollapseQuery.matches) {
			this.state = { navCollapse: true, navClosed: true };
		} else {
			this.state = { navCollapse: false, navClosed: true };
		}
	}

	componentDidMount() {
		this.navCollapseQuery.addListener(this.updateNavCollapse);
	}

	componentWillUnmount() {
		this.navCollapseQuery.removeListener(this.updateNavCollapse);
	}

	updateNavCollapse(query) {
		if (query.matches) {
			this.setState({ navCollapse: true });
		} else {
			this.setState({ navCollapse: false });
		}
	}

	navToogle(state) {
		if (state) {
			this.setState({ navClosed: state });
		} else {
			var newState = !this.state.navClosed;
			console.log(newState);
			this.setState({ navClosed: newState });
		}
	}

	render() {
		return (
			<div className="navBar">
				<h1 id="logo">BC Classes</h1>

				{this.state.navCollapse ? (
					<Menu theme="dark" style={{ float: "right" }}>
						<div style={{ float: "right" }}>
							<MenuOutlined
								onMouseEnter={() => {
									this.navToogle(false);
								}}
								onMouseLeave={() => {
									this.navToogle(true);
								}}
								onMouseDown={() => {
									this.navToogle();
								}}
								className="nav-collapsedIcon"
								style={{ cursor: "pointer" }}
							/>
						</div>
						{this.state.navClosed ? (
							<></>
						) : (
							<div>
								<Menu
									theme="dark"
									mode="vertical"
									// defaultSelectedKeys={["home"]}
									style={{ float: "right", position: "relative", zIndex: "10" }}
								>
									<Menu.Item key="home">
										<Link to={"/"}>Home</Link>
									</Menu.Item>
									<Menu.Item key="logs">
										<Link to={"/logs"}>Logs</Link>
									</Menu.Item>
									<Menu.Item key="about">
										<Link to={"/logs"}>About</Link>
									</Menu.Item>
									{this.state.isLoggedIn ? (
										<Menu.SubMenu title={<ProfilePicture />}>
											<Menu.Item key="settings">Settings</Menu.Item>
											<Menu.Divider />
											<Menu.Item key="logout">Logout</Menu.Item>
										</Menu.SubMenu>
									) : (
										<Menu.Item key="login">Login</Menu.Item>
									)}
								</Menu>
							</div>
						)}
					</Menu>
				) : (
					<Menu
						theme="dark"
						mode="horizontal"
						// defaultSelectedKeys={["home"]}
						style={{ float: "right" }}
					>
						<Menu.Item key="home">
							<Link to={"/"}>Home</Link>
						</Menu.Item>
						<Menu.Item key="logs">
							<Link to={"/logs"}>Logs</Link>
						</Menu.Item>
						<Menu.Item key="about">
							<Link to={"/logs"}>About</Link>
						</Menu.Item>
						{this.state.isLoggedIn ? (
							<Menu.SubMenu title={<ProfilePicture />}>
								<Menu.Item key="settings">Settings</Menu.Item>
								<Menu.Divider />
								<Menu.Item key="logout">Logout</Menu.Item>
							</Menu.SubMenu>
						) : (
							<Menu.Item key="login">Login</Menu.Item>
						)}
					</Menu>
				)}
			</div>
		);
	}
}
export default Nav;
