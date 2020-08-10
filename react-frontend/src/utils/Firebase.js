import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

var firebaseConfig = {
	apiKey: "AIzaSyA1c97cZKND2uc_wXbXJUTsx8l6jjl2oqg",
	authDomain: "bc-classes.firebaseapp.com",
	databaseURL: "https://bc-classes.firebaseio.com",
	projectId: "bc-classes",
	storageBucket: "bc-classes.appspot.com",
	messagingSenderId: "650608369992",
	appId: "1:650608369992:web:da77393ea3804eef0e137d",
	measurementId: "G-CVZKPX2RZ3",
};

// Initialize Firebase
export default firebase.initializeApp(firebaseConfig);
