import React, { Component } from "react";
import { Route, Switch, Link } from "react-router-dom";

import "./App.css";
import Home from "./pages/Home";
import Logs from "./pages/Logs";
import About from "./pages/About";
import Settings from "./pages/Settings";
import ProfilePicture from "../components/ProfilePicture";
import Nav from "../components/Nav";

import Firebase from "../utils/Firebase";

import { Layout } from "antd";
const { Header, Content, Footer } = Layout;

class App extends Component {
	constructor() {
		super();
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
						<Route path="/logs" component={Logs} />
						<Route path="/about" component={About} />
						<Route exact path="/settings" component={Settings} />
					</Switch>
					<Footer style={{ textAlign: "center" }}>
						<p>
							BC Classes ©2020. Created by{" "}
							<a href="https://garytou.com">Gary Tou</a>
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
