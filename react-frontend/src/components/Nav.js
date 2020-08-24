import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Menu } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import Firebase from "../utils/Firebase";
import ProfilePicture from "../components/ProfilePicture";
import Login from "./Login";
import "./Nav.css";

class Nav extends Component {
	navCollapseQuery = window.matchMedia("(max-width: 550px)");

	constructor() {
		super();

		this.updateNavCollapse = this.updateNavCollapse.bind(this);
		this.navToogle = this.navToogle.bind(this);
		this.accountMenuItem = this.accountMenuItem.bind(this);
		this.openLoginModal = this.openLoginModal.bind(this);
		this.closeLoginModal = this.closeLoginModal.bind(this);

		if (this.navCollapseQuery.matches) {
			this.state = {
				navCollapse: true,
				navClosed: true,
				loginModalVisible: false,
			};
		} else {
			this.state = {
				navCollapse: false,
				navClosed: true,
				loginModalVisible: false,
			};
		}
	}

	componentDidMount() {
		this.navCollapseQuery.addListener(this.updateNavCollapse);

		Firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				this.setState({ isLoggedIn: true });
			} else {
				this.setState({ isLoggedIn: false });
			}
		});
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

	menuItems() {
		return [
			<Menu.Item key="home">
				<Link to={"/"}>Home</Link>
			</Menu.Item>,
			<Menu.Item key="logs">
				<Link to={"/logs"}>Logs</Link>
			</Menu.Item>,
			<Menu.Item key="about">
				<Link to={"/about"}>About</Link>
			</Menu.Item>,
			this.accountMenuItem(),
		];
	}

	accountMenuItem() {
		if (this.state.isLoggedIn) {
			return (
				<Menu.SubMenu title={<ProfilePicture />} key="acount-loggedIn">
					<Menu.Item key="settings">
						<Link to={"/settings"}>Settings</Link>
					</Menu.Item>
					<Menu.Divider />
					<Menu.Item
						key="logout"
						onClick={() => {
							Firebase.auth()
								.signOut()
								.then(
									() => {
										console.log("Signed Out");
									},
									(error) => {
										console.log("Sign Out Error:\n", error);
									}
								);
						}}
					>
						Logout
					</Menu.Item>
				</Menu.SubMenu>
			);
		} else {
			return (
				<Menu.Item key="login" onClick={this.openLoginModal}>
					Login
				</Menu.Item>
			);
		}
	}

	openLoginModal() {
		this.setState({ loginModalVisible: true });
	}
	closeLoginModal() {
		this.setState({ loginModalVisible: false });
	}

	render() {
		return (
			<div className="navBar">
				<h1 id="logo">BC Classes</h1>

				{this.state.navCollapse ? (
					<Menu theme="dark" style={{ float: "right" }}>
						<div style={{ float: "right" }}>
							<MenuOutlined
								//onMouseLeave blocks clicking on links on mobile

								// onMouseEnter={() => {
								// 	this.navToogle(false);
								// }}
								// onMouseLeave={() => {
								// 	this.navToogle(true);
								// }}
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
									selectable={false}
								>
									{this.menuItems()}
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
						selectable={false}
					>
						{this.menuItems()}
					</Menu>
				)}
				<Login
					onClose={this.closeLoginModal}
					visible={this.state.loginModalVisible}
				/>
			</div>
		);
	}
}
export default Nav;
