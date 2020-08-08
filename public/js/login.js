// Auth UI
var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start("#firebaseui-auth-container", {
	callbacks: {
		signInSuccessWithAuthResult: function (authResult, redirectUrl) {
			var isNewUser = authResult.additionalUserInfo.isNewUser;
			if (isNewUser) {
				DBaddNewUser(authResult.user).then(() => {
					window.location.replace("/"); //redirect to home
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

					firebase
						.database()
						.ref("users/" + uid)
						.set(data)
						.then(() => {
							resolve();
						});
				});
			}
		},
	},
	// Will use popup for IDP Providers sign-in flow instead of the default, redirect.
	// signInFlow: "popup",
	signInSuccessUrl: "/",
	signInOptions: [
		// firebase.auth.EmailAuthProvider.PROVIDER_ID,
		firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		firebase.auth.FacebookAuthProvider.PROVIDER_ID,
	],
	tosUrl: "",
	privacyPolicyUrl: "",

	// Other config options...
});
