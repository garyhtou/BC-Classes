import React, { Component } from "react";
import PropTypes from "prop-types";
import { Modal } from "antd";
import Firebase from "../utils/Firebase";
import * as pureFirebase from "firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import "./Login.css";

class Login extends Component {
	uiConfig = {
		// Popup signin flow rather than redirect flow.
		signInFlow: "popup",
		// Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
		signInSuccessUrl: "/",
		// We will display Google and Facebook as auth providers.
		signInOptions: [
			pureFirebase.auth.GoogleAuthProvider.PROVIDER_ID,
			pureFirebase.auth.FacebookAuthProvider.PROVIDER_ID,
		],
		callbacks: {
			signInSuccessWithAuthResult: function (authResult, redirectUrl) {
				var isNewUser = authResult.additionalUserInfo.isNewUser;
				if (isNewUser) {
					DBaddNewUser(authResult.user).then(() => {
						// window.location.replace("/"); //redirect to home
					});
				}

				async function DBaddNewUser(user) {
					return new Promise((resolve, reject) => {
						var data = {
							name: user.displayName,
							email: user.email,
							photoURL: user.photoURL,
						};

						var uid = user.uid;

						Firebase.database()
							.ref("users/" + uid)
							.set(data)
							.then(() => {
								resolve();
							});
					});
				}
			},
		},
		tosUrl: "",
		privacyPolicyUrl: "",
	};

	constructor(props) {
		super(props);

		this.state = { loggedIn: true, displayName: null };
	}

	componentDidMount() {
		Firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				this.setState({ loggedIn: true, displayName: user.displayName });
			} else {
				this.setState({ loggedIn: false, displayName: user.displayName });
			}
		});
	}

	render() {
		return (
			<>
				<Modal
					visible={this.props.visible}
					centered={true}
					footer={null}
					onCancel={this.props.onClose}
				>
					<div className="login-modalContainer">
						<h1>BC Classes</h1>
						{this.state.loggedIn ? (
							<p>Welcome {this.state.displayName}!</p>
						) : (
							<>
								<p>Login/Sign up</p>
								<StyledFirebaseAuth
									uiConfig={this.uiConfig}
									firebaseAuth={Firebase.auth()}
								/>
							</>
						)}
					</div>
				</Modal>
			</>
		);
	}
}

Login.propTypes = {
	visible: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
};

export default Login;
