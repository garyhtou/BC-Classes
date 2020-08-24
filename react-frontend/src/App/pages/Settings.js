import React, { Component } from "react";
import { Layout, Spin, Empty, List } from "antd";
import "./Settings.css";
import ProfilePicture from "../../components/ProfilePicture";
import Firebase from "../../utils/Firebase";
import RegItem from "../../components/RegItem";

class Settings extends Component {
	constructor() {
		super();
		this.state = {
			loggedIn: "",
			regLoading: true,
		};
	}

	componentDidMount() {
		//TODO: need to remove listener on dismount
		Firebase.auth().onAuthStateChanged(
			function (user) {
				if (user) {
					var lastSignInTime = Date(user.metadata.lastSignInTime);
					this.setState({ lastSignInTime: lastSignInTime });
					var uid = user.uid;
					this.setState({ uid: uid });
					Firebase.database()
						.ref("/registrations/" + uid)
						.on(
							"value",
							function (snapshot) {
								console.log(snapshot.val());

								if (snapshot.val() === null) {
									this.setState({
										registrations: [],
										regLoading: false,
									});
								} else {
									this.setState({
										registrations: snapshot.val(),
										regLoading: false,
									});
								}
							}.bind(this)
						);
					Firebase.database()
						.ref("/users/" + uid)
						.on(
							"value",
							function (snapshot) {
								this.setState({
									name: snapshot.val().name,
									notifEmail: snapshot.val().email,
								});
							}.bind(this)
						);
					this.setState({ loggedIn: true });
				} else {
					this.setState({ loggedIn: false });
				}
			}.bind(this)
		);
	}

	render() {
		return (
			<Layout.Content className="settings-content">
				<div className="page-contents">
					<div className="page-titleContainer">
						<h1 className="page-title1">Settings</h1>
					</div>
					{this.state.loggedIn === true ? (
						<>
							<div className="settings-section settings-profile">
								<div className="profile-flexItem profile-profilePicture">
									<ProfilePicture size={200} />
								</div>
								<div className="profile-flexItem profile-info">
									<h1 className="profile-infoName">{this.state.name}</h1>
									<p className="profile-infoOther">
										{/* TODO: Allow for editing of notif email */}
										<strong>Notification Email:</strong> {this.state.notifEmail}
									</p>
									<p className="profile-infoOther">
										<strong>Last Login:</strong> {this.state.lastSignInTime}
									</p>
								</div>
							</div>
							<div className="settings-reg">
								<h1>Registrations</h1>
								{this.state.regLoading ? (
									<Spin />
								) : (
									<>
										{this.state.registrations.length === 0 ? (
											<Empty />
										) : (
											<>
												<List>
													{Object.keys(this.state.registrations).map(
														(pushKey) => {
															return (
																<List.Item>
																	<RegItem
																		uid={this.state.uid}
																		pushKey={pushKey}
																		data={this.state.registrations[pushKey]}
																	/>
																</List.Item>
															);
														}
													)}
												</List>
											</>
										)}
									</>
								)}
							</div>
						</>
					) : this.state.loggedIn === false ? (
						<div className="settings-section">
							<p>You must be logged in.</p>
						</div>
					) : (
						<Spin />
					)}
				</div>
			</Layout.Content>
		);
	}
}
export default Settings;
