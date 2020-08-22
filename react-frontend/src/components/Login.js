import React, { Component } from "react";
import { Modal } from "antd";
import Firebase from "../utils/Firebase";
import * as pureFirebase from "firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import "./Login.css";

const uiConfig = {
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

class Login extends Component {
	constructor() {
		super();
		this.state = {};
	}

	componentDidMount() {}

	render() {
		return (
			<>
				<Modal visible={true} centered={true} footer={null}>
					<h1>Login</h1>
					<p>sdsdf</p>
					<StyledFirebaseAuth
						uiConfig={uiConfig}
						firebaseAuth={Firebase.auth()}
					/>
				</Modal>
			</>
		);
	}
}

export default Login;
