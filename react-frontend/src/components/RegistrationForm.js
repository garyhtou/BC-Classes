import React, { Component } from "react";
import {
	Steps,
	Form,
	Button,
	Select,
	Spin,
	Space,
	Checkbox,
	InputNumber,
	Descriptions,
	Alert,
} from "antd";
import Firebase from "../utils/Firebase";
import "./RegistrationForm.css";

class RegistrationForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			current: 0,
			isLoaded: false,
			error: null,
			submitError: [],
		};
		this.submitForm = this.submitForm.bind(this);
		this.addSubmitError = this.addSubmitError.bind(this);
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
		this.setState({ submitLoading: true });
		// create object
		var formData = {
			quarter: this.state.formQuarter,
			subject: this.state.formSubject,
			course: this.state.formCourse,
			section: this.state.formSection,
			instructor: this.state.formInstructor,
			seats: this.state.formSeatsCheckbox === false ? -1 : this.state.formSeats,
		};
		console.log(formData);
		var method = "POST";
		var url = "/register";
		//get id token
		var user = Firebase.auth().currentUser;
		if (user) {
			user
				.getIdToken(/* forceRefresh */ true)
				.then(function (idToken) {
					//send request
					fetch(url, {
						method: method,
						headers: { Authorization: "Bearer " + idToken },
						body: JSON.stringify(formData),
					})
						.then((response) => response.json())
						.then((data) => {
							this.setState({ submitLoading: false });
							this.addSubmitError(data);
						});
				})
				.catch(function (error) {
					this.setState({ submitLoading: false });
					this.addSubmitError(error);
				});
		} else {
			setTimeout(() => {
				this.setState({ submitLoading: false });
				this.addSubmitError("Not signed in");
				// TODO SIGN IN/UP MODAL
			}, 2000);
		}
	}

	addSubmitError(message) {
		var submitErrorArray = this.state.submitError.slice();
		submitErrorArray.push(message);
		this.setState({
			submitError: submitErrorArray,
		});
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
			var sections = [];
			for (var section in this.state.data.classes.quarters[
				this.state.formQuarter
			][this.state.formSubject].Courses[value].Sections) {
				sections.push(section);
			}
			console.log(sections);
			this.setState({ formCourse: value, sections });
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
			if (values.quarter === undefined) {
				this.setState({ quarterValidateStatus: "error" });
				this.setState({ quarterHelp: "Please select a quarter" });
				error = true;
			} else if (!quarters.includes(values.quarter)) {
				this.setState({ quarterValidateStatus: "error" });
				this.setState({ quarterHelp: "Invalid quarter" });
				error = true;
			}

			// validating subject
			var subjects = this.state.subjects;
			if (values.subject === undefined) {
				this.setState({ subjectValidateStatus: "error" });
				this.setState({ subjectHelp: "Please select a subject" });
				error = true;
			} else if (!subjects.includes(values.subject)) {
				this.setState({ subjectValidateStatus: "error" });
				this.setState({ subjectHelp: "Invalid subject" });
				error = true;
			}

			// validating course
			var courses = this.state.courses;
			if (values.course === undefined) {
				this.setState({ courseValidateStatus: "error" });
				this.setState({ courseHelp: "Please select a course" });
				error = true;
			} else if (!courses.includes(values.course)) {
				this.setState({ courseValidateStatus: "error" });
				this.setState({ courseHelp: "Invalid course" });
				error = true;
			}

			if (!error) {
				this.next();
			}
		};

		const onStep2SelectSection = () => {
			this.setState({ notificationType: "section" });
		};

		const onStep2SelectCourse = () => {
			this.setState({ formSection: "" });
			this.setState({ formInstructor: false });
			this.setState({ formSeats: -1 });
			this.next();
			this.setState({ notificationType: "course" });
		};

		const onSectionChange = (value) => {
			console.log(value);

			this.setState({ formSection: value });
			this.setState({ sectionValidateStatus: "success" });
			this.setState({ sectionHelp: null });
		};

		const onInstructorChange = (value) => {
			var checked = value.target.checked;
			console.log(checked);

			this.setState({ formInstructor: checked });
			this.setState({ seatsCheckboxValidateStatus: "success" });
			this.setState({ seatsCheckboxHelp: null });
		};

		const onSeatsCheckboxChange = (value) => {
			var checked = value.target.checked;
			console.log(checked);

			this.setState({ formSeatsCheckbox: checked });
			this.setState({ seatsCheckboxValidateStatus: "success" });
			this.setState({ seatsCheckboxHelp: null });
		};

		const onSeatsChange = (value) => {
			console.log(value);

			this.setState({ formSeats: value });
			if (value > 300) {
				this.setState({ seatsCheckboxValidateStatus: "error" });
				this.setState({
					seatsCheckboxHelp: "Are there really " + value + " seats?!",
				});
			} else {
				this.setState({ seatsCheckboxValidateStatus: "success" });
				this.setState({ seatsCheckboxHelp: null });
			}
		};

		const onStep2Finish = (values) => {
			console.log("FINISHED 2:");
			console.log(values);

			var error = false;

			// validating section
			var sections = this.state.sections;
			if (values.section === undefined) {
				this.setState({ sectionValidateStatus: "error" });
				this.setState({ sectionHelp: "Please select a section" });
				error = true;
			} else if (!sections.includes(values.section)) {
				this.setState({ sectionValidateStatus: "error" });
				this.setState({ sectionHelp: "Invalid section" });
				error = true;
			} else {
				this.setState({ sectionValidateStatus: "success" });
				this.setState({ sectionHelp: null });
			}

			var instructor =
				this.state.formInstructor === undefined
					? false
					: this.state.formInstructor;
			var seatsCheckbox =
				this.state.formSeatsCheckbox === undefined
					? false
					: this.state.formSeatsCheckbox;

			if (!instructor && !seatsCheckbox) {
				this.setState({ seatsCheckboxValidateStatus: "error" });
				this.setState({
					seatsCheckboxHelp:
						"Please select to be notified about instructor changes and/or changes in available seats.",
				});
				error = true;
			}

			if (this.state.formSeats === undefined) {
				this.setState({ formSeats: 5 });
			}

			if (!error) {
				this.next();
			}
		};

		return (
			<div className="reg-wrapper">
				<h3>Register for updates about a class!</h3>
				<div className="reg-container">
					<div className="reg-steps">
						<Steps direction="vertical" current={this.state.current}>
							<Steps.Step
								title="Choose a class"
								status={
									this.state.current === 0
										? "process"
										: this.state.current > 0
										? "finish"
										: "wait"
								}
								description="Select a quarter, subject, and course."
							/>
							<Steps.Step
								title="Customize"
								status={
									this.state.current === 1
										? "process"
										: this.state.current > 1
										? "finish"
										: "wait"
								}
								description="Select a Section and your notification settings."
							/>
							<Steps.Step
								title="Submit"
								status={
									this.state.current === 2
										? "process"
										: this.state.current > 2
										? "finish"
										: "wait"
								}
								description="Stay updated to any changes!"
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
													hasFeedback
													validateStatus={this.state.quarterValidateStatus}
													help={this.state.quarterHelp}
													initialValue={
														this.state.formQuarter !== undefined
															? this.state.formQuarter
															: undefined
													}
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
													hasFeedback
													validateStatus={this.state.subjectValidateStatus}
													help={this.state.subjectHelp}
													initialValue={
														this.state.formSubject !== undefined
															? this.state.formSubject
															: undefined
													}
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
													hasFeedback
													validateStatus={this.state.courseValidateStatus}
													help={this.state.courseHelp}
													initialValue={
														this.state.formCourse !== undefined
															? this.state.formCourse
															: undefined
													}
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
											</Form>
										)}
									</>
								) : (
									<Spin size="large" />
								)}
							</>
						)}
						{this.state.current === 1 && (
							<>
								{this.state.notificationType === undefined ||
								this.state.notificationType === "course" ? (
									<>
										<h3>Recieve notifications about</h3>
										<div className="step2-container">
											<div className="step2-side">
												<Button
													className="step2-button"
													onClick={onStep2SelectSection}
												>
													<p className="step2-buttonTitle">
														A <strong>specific </strong> Sections in{" "}
														{this.state.formCourse}
													</p>
													<p className="step2-buttonDesc">
														Such as changes to the instructor and available
														seats in Section {this.state.sections[0]} of{" "}
														{this.state.formCourse}
													</p>
												</Button>
											</div>
											<div className="step2-side" onClick={onStep2SelectCourse}>
												<Button className="step2-button">
													<p className="step2-buttonTitle">
														<strong>Addition</strong> / <strong>Removal</strong>{" "}
														of Sections in {this.state.formCourse}
													</p>
												</Button>
											</div>
										</div>
										<div>
											<Button
												type="default"
												onClick={() => {
													this.prev();
												}}
											>
												Back
											</Button>
										</div>
									</>
								) : this.state.notificationType === "section" ? (
									<Form
										layout="vertical"
										hideRequiredMark
										onFinish={onStep2Finish}
									>
										<Form.Item
											name="section"
											label="Select a Section"
											hasFeedback
											validateStatus={this.state.sectionValidateStatus}
											help={this.state.sectionHelp || "aka Item #"}
											initialValue={
												this.state.formSection !== undefined
													? this.state.formSection
													: undefined
											}
										>
											<Select onChange={onSectionChange} showSearch>
												{this.state.sections.map((data) => {
													return (
														<Select.Option value={data}>{data}</Select.Option>
													);
												})}
											</Select>
										</Form.Item>
										<p className="step2-sectionComment">
											<strong>Get notified about changes in...</strong>
										</p>
										<Form.Item name="instructor" className="optionCheckbox">
											<Checkbox
												onChange={onInstructorChange}
												checked={
													this.state.formInstructor !== undefined
														? this.state.formInstructor
														: false
												}
											>
												Instructor
											</Checkbox>
										</Form.Item>
										<Form.Item
											name="seatsCheckbox"
											// valuePropName="checked"
											validateStatus={this.state.seatsCheckboxValidateStatus}
											help={this.state.seatsCheckboxHelp}
										>
											<Checkbox
												onChange={onSeatsCheckboxChange}
												checked={
													this.state.formSeatsCheckbox !== undefined
														? this.state.formSeatsCheckbox
														: false
												}
											>
												{this.state.formSeatsCheckbox ? (
													<>
														Available seats, when it drops to or below{" "}
														<InputNumber
															size="small"
															defaultValue={
																this.state.formSeats !== -1 &&
																this.state.formSeats !== "" &&
																this.state.formSeats !== undefined
																	? this.state.formSeats
																	: 5
															}
															min={0}
															step={1}
															onChange={onSeatsChange}
														></InputNumber>
													</>
												) : (
													"Available seats"
												)}
											</Checkbox>
										</Form.Item>
										<Form.Item>
											<Space>
												<Button
													type="default"
													onClick={() => {
														this.setState({ notificationType: undefined });
													}}
												>
													Back
												</Button>
												<Button type="primary" htmlType="submit">
													Next!
												</Button>
											</Space>
										</Form.Item>
									</Form>
								) : (
									<></>
								)}
							</>
						)}
						{this.state.current === 2 && (
							<>
								<Descriptions title="Class Notification">
									<Descriptions.Item label="Quarter">
										{
											this.state.data.quarters[this.state.formQuarter]
												.FriendlyName
										}
									</Descriptions.Item>
									<Descriptions.Item label="Subject">
										{this.state.formSubject}
									</Descriptions.Item>
									<Descriptions.Item label="Course">
										{this.state.formCourse}
									</Descriptions.Item>
									{this.state.formSection === "" ? (
										<></>
									) : (
										<>
											<Descriptions.Item label="Section">
												{this.state.formSection}
											</Descriptions.Item>
											<Descriptions.Item label="Notify on Instructor Change">
												{this.state.formInstructor === true ? "Yes" : "No"}
											</Descriptions.Item>
											<Descriptions.Item label="Notify on Available Seats Change">
												{this.state.formSeatsCheckbox === true ? (
													<>Yes, at {this.state.formSeats}</>
												) : (
													"No"
												)}
											</Descriptions.Item>
										</>
									)}
								</Descriptions>
								{this.state.formSection === "" ? (
									<p>
										You will be notified if a section is added or removed from{" "}
										{this.state.formCourse}!
									</p>
								) : (
									<p>
										You will be notified if there are changes to Section{" "}
										{this.state.formSection} in {this.state.formCourse}!
									</p>
								)}
								{this.state.submitError.map((message) => {
									return (
										<Alert
											className="step3-submitErrorAlert"
											message={message}
											type="error"
											showIcon
											closable
										/>
									);
								})}
								<Space className="step3-submitButton">
									<Button
										type="default"
										onClick={() => {
											this.prev();
										}}
									>
										Back
									</Button>
									<Button
										type="primary"
										htmlType="submit"
										onClick={this.submitForm}
										loading={this.state.submitLoading}
									>
										Submit!
									</Button>
								</Space>
							</>
						)}
					</div>
				</div>
			</div>
		);
	}
}

export default RegistrationForm;
