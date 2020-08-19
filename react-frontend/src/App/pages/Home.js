import React, { Component } from "react";
import { Layout } from "antd";
import RegistrationForm from "../../components/RegistrationForm";
import "./Home.css";

class Home extends Component {
	render() {
		return (
			<Layout.Content className="home-content">
				<div className="page-contents">
					<div className="page-titleContainer">
						<h1 className="page-title1">Monitor</h1>
						<h1 className="page-title2">Your Classes</h1>
					</div>
					<RegistrationForm />
				</div>
			</Layout.Content>
		);
	}
}
export default Home;
