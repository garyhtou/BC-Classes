import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button, Layout } from "antd";
import ProfilePicture from "../../components/ProfilePicture";
import RegistrationForm from "../../components/RegistrationForm";
import "./Home.css";

class Home extends Component {
	render() {
		return (
			<Layout.Content className="home-content">
				<div className="home">
					<div className="home-titleContainer">
						<h1 className="home-title1">Monitor</h1>
						<h1 className="home-title2">Your Classes</h1>
					</div>
					<RegistrationForm />
				</div>
			</Layout.Content>
		);
	}
}
export default Home;
