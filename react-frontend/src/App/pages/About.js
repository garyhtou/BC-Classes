import React, { Component } from "react";
import { Layout } from "antd";
import "./About.css";
import Login from "../../components/Login";

class About extends Component {
	render() {
		return (
			<Layout.Content className="about-content">
				<div className="page-contents">
					<div className="page-titleContainer">
						<h1 className="page-title1">About</h1>
					</div>
				</div>
			</Layout.Content>
		);
	}
}
export default About;
