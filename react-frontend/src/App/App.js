import React, { Component } from "react";
import { Route, Switch, Link } from "react-router-dom";

import "./App.css";
import Home from "./pages/Home";
import List from "./pages/List";
import Settings from "./pages/Settings";
import ProfilePicture from "../components/ProfilePicture";
import Nav from "../components/Nav";

import Firebase from "../utils/Firebase";

import { Layout } from "antd";
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
						<Nav />
					</Header>
					<Switch>
						<Route exact path="/" component={Home} />
						<Route exact path="/settings" component={Settings} />
						<Route path="/list" component={List} />
					</Switch>
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
