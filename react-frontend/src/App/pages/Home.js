import React, { Component } from "react";
import { Layout } from "antd";
import RegistrationForm from "../../components/RegistrationForm";
import "./Home.css";

class Home extends Component {
	constructor() {
		super();
		this.state = { regKey: "reg-show" };
		this.remountReg = this.remountReg.bind(this);
	}

	remountReg = function () {
		this.setState({ regKey: "reg-reset" }, () => {
			this.setState({ regKey: "reg-show" });
		});
	};

	render() {
		return (
			<Layout.Content className="home-content">
				<div className="page-contents">
					<div className="page-titleContainer">
						<h1 className="page-title1">Monitor</h1>
						<h1 className="page-title2">Your Classes</h1>
					</div>
					<RegistrationForm
						key={this.state.regKey}
						remountMe={this.remountReg}
					/>
				</div>
			</Layout.Content>
		);
	}
}
export default Home;
