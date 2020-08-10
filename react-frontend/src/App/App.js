import React, { Component } from "react";
import { Route, Switch, Link } from "react-router-dom";

import "./App.css";
import Home from "./pages/Home";
import List from "./pages/List";
import Settings from "./pages/Settings";
import ProfilePicture from "../components/ProfilePicture";

import Firebase from "../utils/Firebase";

import { Layout, Menu, Button } from "antd";
const { Header, Content, Footer } = Layout;

class App extends Component {
	constructor() {
		super();

		if (Firebase.auth().currentUser != null) {
			this.state = { isLoggedIn: true };
		} else {
			this.state = { isLoggedIn: false };
		}
		Firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				this.setState({ isLoggedIn: true });
			} else {
				this.setState({ isLoggedIn: false });
			}
		});
	}

	render() {
		const App = () => (
			<div>
				<Layout className="layout">
					<Header>
						<h1 id="logo">BC Classes</h1>
						<Menu
							theme="dark"
							mode="horizontal"
							defaultSelectedKeys={["home"]}
							style={{ float: "right" }}
						>
							<Menu.Item key="home">
								<Link to={"/"}>Home</Link>
							</Menu.Item>
							<Menu.Item key="logs">
								<Link to={"/list"}>Logs</Link>
							</Menu.Item>
							<Menu.Item key="about">
								<Link to={"/list"}>About</Link>
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
					</Header>
					<Content style={{ padding: "0 50px" }}>
						<Switch>
							<Route exact path="/" component={Home} />
							<Route exact path="/settings" component={Settings} />
							<Route path="/list" component={List} />
						</Switch>
					</Content>
					<Footer style={{ textAlign: "center" }}>
						<p>
							BC Classes ©2020 Created by{" "}
							<a href="https://garytou.com">
								<ProfilePicture /> <span>Gary Tou</span>
							</a>
						</p>
					</Footer>
				</Layout>
			</div>
		);
		return (
			<Switch>
				<App />
			</Switch>
		);
	}
}

export default App;
