import React, { Component } from "react";
import { Steps, Form, Button, Select, Spin } from "antd";
import Firebase from "../utils/Firebase";
import "./RegistrationForm.css";

class RegistrationForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			current: 1,
			isLoaded: false,
			error: null,
		};
	}

	componentDidMount() {
		fetch("/data")
			.then((res) => res.json())
			.then(
				(data) => {
					var quarters = [];

					for (var quarterObj in data.quarters) {
						quarters.push([data.quarters[quarterObj].FriendlyName, quarterObj]);
					}

					this.setState({
						isLoaded: true,
						data,
						quarters,
					});
				},
				(error) => {
					console.log(error);
					this.setState({
						isLoaded: true,
						error,
					});
				}
			);
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
		const onQuarterChange = (value) => {
			console.log(value);
			var subjects = [];
			for (var subject in this.state.data.classes.quarters[value]) {
				subjects.push(subject);
			}
			console.log(subjects);
			this.setState({ formQuarter: value, subjects });
			this.setState({ quarterValidateStatus: "success" });
			this.setState({ quarterHelp: null });
		};

		const onSubjectChange = (value) => {
			console.log(value);
			var courses = [];
			for (var course in this.state.data.classes.quarters[
				this.state.formQuarter
			][value].Courses) {
				courses.push(course);
			}
			console.log(courses);
			this.setState({ formSubject: value, courses });
			this.setState({ subjectValidateStatus: "success" });
			this.setState({ subjectHelp: null });
		};

		const onCourseChange = (value) => {
			console.log(value);
			this.setState({ formCourse: value });
			this.setState({ courseValidateStatus: "success" });
			this.setState({ courseHelp: null });
		};

		const onStep1Finish = (values) => {
			console.log("FINISHED:");
			console.log(values);

			var error = false;

			// validating quarter
			var quarters = [];
			for (var quarter of this.state.quarters) {
				quarters.push(quarter[1]);
			}
			if (!quarters.includes(values.quarter)) {
				this.setState({ quarterValidateStatus: "error" });
				this.setState({ quarterHelp: "Invalid quarter" });
				error = true;
			}

			// validating subject
			var subjects = this.state.subjects;
			if (!subjects.includes(values.subject)) {
				this.setState({ subjectValidateStatus: "error" });
				this.setState({ subjectHelp: "Invalid subject" });
			}

			// validating course
			var courses = this.state.courses;
			if (!courses.includes(values.course)) {
				this.setState({ courseValidateStatus: "error" });
				this.setState({ courseHelp: "Invalid course" });
			}

			if (!error) {
				this.next();
			}
		};

		const validate = () => {};

		return (
			<div className="reg-wrapper">
				<h3>Register for updates about a class!</h3>
				<div className="reg-container">
					<div className="reg-steps">
						<Steps
							direction="vertical"
							current={this.state.current}
							className="bottomSpace"
						>
							<Steps.Step
								title="Choose a class"
								status={
									this.state.current == 0
										? "process"
										: this.state.current > 0
										? "finish"
										: "wait"
								}
								description="Select a quarter, subject, and course."
							/>
							<Steps.Step
								title="Course or Section"
								status={
									this.state.current == 1
										? "process"
										: this.state.current > 1
										? "finish"
										: "wait"
								}
								description="Select a quarter, subject, and course."
							/>
							<Steps.Step
								title="Customize Updates"
								status={
									this.state.current == 2
										? "process"
										: this.state.current > 2
										? "finish"
										: "wait"
								}
								description="Select a quarter, subject, and course."
							/>
						</Steps>
					</div>
					<div className="reg-steps-content">
						{this.state.current === 0 && (
							<>
								{this.state.isLoaded ? (
									<>
										{this.state.error ? (
											<p>Uh Oh! Unable to connect with our servers...</p>
										) : (
											<Form
												layout="vertical"
												hideRequiredMark
												onFinish={onStep1Finish}
											>
												<Form.Item
													name="quarter"
													label="Select a Quarter"
													rules={[
														{
															required: true,
															message: "Please select a quarter!",
														},
													]}
													hasFeedback
													validateStatus={this.state.quarterValidateStatus}
													help={this.state.quarterHelp}
												>
													<Select onChange={onQuarterChange} showSearch>
														{this.state.quarters.map((data) => {
															const name = data[0];
															const value = data[1];
															return (
																<Select.Option value={value}>
																	{name}
																</Select.Option>
															);
														})}
													</Select>
												</Form.Item>
												<Form.Item
													name="subject"
													label="Select a Subject"
													rules={[
														{
															required: true,
															message: "Please select a subject!",
														},
													]}
													hasFeedback
													validateStatus={this.state.subjectValidateStatus}
													help={this.state.subjectHelp}
												>
													<Select showSearch onChange={onSubjectChange}>
														{this.state.subjects === undefined ||
														this.state.quarterValidateStatus === "error" ? (
															<Select.Option disabled>
																Select a Quarter
															</Select.Option>
														) : (
															<>
																{this.state.subjects.map((subject) => {
																	return (
																		<Select.Option value={subject}>
																			{subject}
																		</Select.Option>
																	);
																})}
															</>
														)}
													</Select>
												</Form.Item>
												<Form.Item
													name="course"
													label="Select a Course"
													rules={[
														{
															required: true,
															message: "Please select a course!",
														},
													]}
													hasFeedback
													validateStatus={this.state.courseValidateStatus}
													help={this.state.courseHelp}
												>
													<Select showSearch onChange={onCourseChange}>
														{this.state.courses === undefined ||
														this.state.subjectValidateStatus === "error" ? (
															<Select.Option disabled>
																Select a Subject
															</Select.Option>
														) : (
															<>
																{this.state.courses.map((course) => {
																	return (
																		<Select.Option value={course}>
																			{course}
																		</Select.Option>
																	);
																})}
															</>
														)}
													</Select>
												</Form.Item>
												<Form.Item>
													<Button type="primary" htmlType="submit">
														Next!
													</Button>
												</Form.Item>
												{/* create save method per step. update state with user values and call next() */}
											</Form>
										)}
									</>
								) : (
									<Spin></Spin>
								)}
							</>
						)}
						{this.state.current === 1 && (
							<>
								<h3>Recieve notifications about</h3>
								<div className="step2-container">
									<div className="step2-side bottomSpace">
										<Button className="step2-button">
											<h1>
												Addition/Removal of Sections in {this.state.formCourse}
											</h1>
										</Button>
									</div>
									<div className="step2-side bottomSpace">
										<Button className="step2-button">
											<p class="step2-buttonTitle">A specific Sections in {this.state.formCourse}</p>
											<p>changes in avaliable seats and instructor</p>
										</Button>
									</div>
								</div>
								<Button
									type="primary"
									onClick={() => {
										this.prev();
									}}
								>
									Previous
								</Button>
							</>
						)}
						{this.state.current === 2 && <p>2</p>}
					</div>
				</div>
			</div>
		);
	}
}

export default RegistrationForm;
