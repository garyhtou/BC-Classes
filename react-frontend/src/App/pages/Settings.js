import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Layout } from "antd";

class Settings extends Component {
	render() {
		return (
			<Layout.Content style={{ padding: "0 50px" }}>
				<div className="App">
					<h1>Project Home</h1>
					{/* Link to List.js */}
					<Link to={"./list"}>
						<button variant="raised">My List</button>
					</Link>
				</div>
			</Layout.Content>
		);
	}
}
export default Settings;
