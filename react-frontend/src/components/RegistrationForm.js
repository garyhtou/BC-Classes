import React, { Component } from "react";
import { Steps, Form, Button } from "antd";
import Firebase from "../utils/Firebase";
import "./RegistrationForm.css";

const steps = [
	{
		title: "First",
		content: "First-content",
	},
	{
		title: "Second",
		content: "Second-content",
	},
	{
		title: "Last",
		content: "Last-content",
	},
];

class RegistrationForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			current: 0,
		};
	}

	next() {
		const nextStep = this.state.current + 1;
		this.setState({ current: nextStep });
	}

	prev() {
		const prevStep = this.state.current - 1;
		this.setState({ current: prevStep });
	}

	submitForm() {
		// COPIED FROM ORIGINAL HOME.JS
		//prevent default
		//create object
		// var form = $(this);
		// var formData = {
		// 	quarter: $("input[name=quarter]").val(),
		// 	subject: $("input[name=subject]").val(),
		// 	course: $("input[name=course]").val(),
		// 	section: $("input[name=section]").val(),
		// 	instructor: $("input[name=instructor]").prop("checked"),
		// 	seats: $("input[name=seats]").val(),
		// };
		// formData.seats = parseInt(formData.seats);
		// console.log(formData);
		// var method = form.attr("method");
		// var url = form.attr("action");
		// //get id token
		// var user = Firebase.auth().currentUser;
		// if (user) {
		// 	user
		// 		.getIdToken(/* forceRefresh */ true)
		// 		.then(function (idToken) {
		// 			//send request
		// 			$.ajax({
		// 				type: method,
		// 				url: url,
		// 				data: JSON.stringify(formData), // serializes the form's elements.
		// 				contentType: "application/json",
		// 				beforeSend: function (xhr) {
		// 					//add id token to header
		// 					xhr.setRequestHeader("Authorization", "Bearer " + idToken);
		// 				},
		// 			})
		// 				.done(function (result) {
		// 					alert(result); // show response from the server.
		// 					$("#registrationForm").reset();
		// 				})
		// 				.fail(function (result) {
		// 					alert(result.responseText);
		// 				})
		// 				.always(function (result) {
		// 					//
		// 				});
		// 		})
		// 		.catch(function (error) {
		// 			alert(error);
		// 		});
		// } else {
		// 	this.notSignedIn();
		// }
	}

	render() {
		const { current } = this.state;
		return (
			<div className="reg-wrapper">
				<h3>Register for updates about a class!</h3>
				<div className="reg-container">
					<div className="reg-steps">
						<Steps direction="vertical" current={current}>
							<Steps.Step
								title="Select a Course"
								status="process"
								description="This is a description."
							/>
							<Steps.Step
								title="Course or Section"
								status="wait"
								description="This is a description."
							/>
							<Steps.Step
								title="Customize Updates"
								status="wait"
								description="This is a description."
							/>
						</Steps>
					</div>
					<div className="reg-steps-content">
						{current === 0 && (
							<>
								<p>Select a Quarter</p>
								{/* add field. get value form state. set state on constructor */}
								<Button onClick={() => this.next()}>Next!</Button>
								{/* create save method per step. update state with user values and call next() */}
							</>
						)}
						{current === 1 && <p>1</p>}
						{current === 2 && <p>2</p>}
					</div>
				</div>
			</div>
		);
	}
}

export default RegistrationForm;
