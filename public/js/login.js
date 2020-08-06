// Auth UI
var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start("#firebaseui-auth-container", {
	callbacks: {
		signInSuccessWithAuthResult: function (authResult, redirectUrl) {
			var isNewUser = authResult.additionalUserInfo.isNewUser;
			if (isNewUser) {
				var data = {
					name: authResult.user.displayName,
					email: authResult.user.email,
					photoURL: authResult.user.photoURL,
				};

				firebase
					.database()
					.ref("/users/" + authResult.user.uid)
					.set(data);
			}
			// User successfully signed in.
			// Return type determines whether we continue the redirect automatically
			// or whether we leave that to developer to handle.
			return true;
		},
	},
	// Will use popup for IDP Providers sign-in flow instead of the default, redirect.
	// signInFlow: "popup",
	signInSuccessUrl: "/",
	signInOptions: [
		firebase.auth.EmailAuthProvider.PROVIDER_ID,
		firebase.auth.GoogleAuthProvider.PROVIDER_ID,
	],
	tosUrl: "",
	privacyPolicyUrl: "",

	// Other config options...
});
