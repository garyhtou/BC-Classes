import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import ProfilePicture from "../../components/ProfilePicture";
import RegistrationForm from "../../components/RegistrationForm";

class Home extends Component {
	render() {
		return (
			<div className="App">
				<h1>Project Home</h1>
				<div>
					<RegistrationForm />
				</div>
				<br />
				<br />
				<br />
				<Button type="primary">Button</Button>
				<Link to={"./list"}>
					<button variant="raised">My List</button>
				</Link>
			</div>
		);
	}
}
export default Home;
