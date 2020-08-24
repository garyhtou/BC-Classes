import React, { Component } from "react";
import { Avatar } from "antd";
import Firebase from "../utils/Firebase";

class ProfilePicture extends Component {
	constructor() {
		super();
		this.state = { photoURL: "" };
	}

	componentDidMount() {
		//TODO: need to remove listener on dismount
		Firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				this.setState({ photoURL: user.photoURL });
				var uid = user.uid;
				Firebase.database()
					.ref("/users/" + uid + "/photoURL/")
					.on(
						"value",
						function (snapshot) {
							if (snapshot !== null) {
								this.setState({ photoURL: snapshot.val() });
							} else {
								this.setState({
									photoURL: "https://www.gravatar.com/avatar/?d=mp",
								});
							}
						}.bind(this)
					);
			} else {
				this.setState({ photoURL: "https://www.gravatar.com/avatar/?d=mp" });
			}
		});
	}

	render() {
		return (
			<Avatar
				className="profilePicture"
				shape="circle"
				alt="Profile Picture"
				src={this.state.photoURL}
				size={this.props.size}
			></Avatar>
		);
	}
}

export default ProfilePicture;
