import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import ProfilePicture from "../../components/ProfilePicture";

class Home extends Component {
	render() {
		return (
			<div className="App">
				<h1>Project Home</h1>
				<Button type="primary">Button</Button>
				<Link to={"./list"}>
					<button variant="raised">My List</button>
				</Link>
				<ProfilePicture />
				<ProfilePicture />
				<ProfilePicture />
				<ProfilePicture />
				<ProfilePicture />
				<ProfilePicture />
				<ProfilePicture />
				<ProfilePicture />
				<ProfilePicture />
			</div>
		);
	}
}
export default Home;
