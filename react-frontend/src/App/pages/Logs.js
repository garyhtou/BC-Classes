import React, { Component } from "react";
import { Layout, Timeline, List, Avatar, Spin } from "antd";
import {
	PlusCircleOutlined,
	MinusCircleOutlined,
	CloseCircleOutlined,
} from "@ant-design/icons";
import "./Logs.css";
import Firebase from "firebase";

class Logs extends Component {
	constructor() {
		super();
		this.state = {
			loading: true,
			error: null,
			data: null,
			names: {
				quarters: "Quarters",
				subjects: "Subjects",
				courses: "Courses",
				sections: "Sections",
				instructor: "Instructor",
				seats: "Seats",
			},
		};
	}

	fbChangeRef = Firebase.database().ref("/changes/");

	componentDidMount() {
		var listener = this.fbChangeRef.on("value", (snapshot) => {
			var history = snapshot.val();
			var data = [];
			for (var push in history) {
				var pushObj = history[push];
				if (pushObj.changes !== null) {
					var date = new Date(pushObj.time).toLocaleDateString("en-US", {
						dateStyle: "long",
					});
					var time = new Date(pushObj.time).toLocaleTimeString("en-US", {
						timeStyle: "short",
					});
					var fullDate = date + " | " + time;

					var changeItem = {
						time: fullDate,
						quarters: [],
						subjects: [],
						courses: [],
						sections: [],
						instructor: [],
						seats: [],
					};

					for (var topic in pushObj.changes) {
						var topicObj = pushObj.changes[topic];

						for (var topicItem in topicObj) {
							var topicItemObj = topicObj[topicItem];

							var locationLast = topicItemObj[2][topicItemObj[2].length - 1];
							if (locationLast == undefined) {
								locationLast = "avalaible quarters";
							}

							var location = "";
							// remove subject if course is in path
							if (topic == "quarter") {
								location = locationLast;
							} else if (topic == "subject") {
								location = topicItemObj[2].join(", ");
							} else if (
								topic == "section" ||
								topic == "instructor" ||
								topic == "seats"
							) {
								var locListNoSubject = [...topicItemObj[2]];
								locListNoSubject[3] = "section " + locListNoSubject[3];
								locationLast = locListNoSubject[3];
								locListNoSubject.splice(1, 1);
								location = locListNoSubject.join(", ");
							} else {
								var locListNoSubject = [...topicItemObj[2]];
								locListNoSubject.splice(1, 1);
								location = locListNoSubject.join(", ");
							}

							if (topicItemObj[0] == "changed") {
								var changeNew;
								var changeOld;

								if (topic === "instructor") {
									if (topicItemObj[1][0] === "") {
										changeNew = "Staff";
									} else {
										changeNew = topicItemObj[1][0];
									}
									if (topicItemObj[1][1] === "") {
										changeOld = "Staff";
									} else {
										changeOld = topicItemObj[1][1];
									}
								}

								changeItem[topic].push([
									"changed",
									"Changed from <b>" +
										changeOld +
										"</b> to <b>" +
										changeNew +
										"</b> for " +
										location +
										".",
								]);
							} else if (topicItemObj[0] == "added") {
								changeItem[topic].push([
									"added",
									"<b>" +
										topicItemObj[1] +
										"</b> was <b>added</b> to " +
										location +
										".",
								]);
							} else if (topicItemObj[0] == "removed") {
								changeItem[topic].push([
									"removed",
									"<b>" +
										topicItemObj[1] +
										"</b> has been <b>removed</b> from " +
										location +
										".",
								]);
							}
						}
					}

					data.push(changeItem);
				}
			}
			console.log(data);
			this.setState({ loading: false, data: data, fbListener: listener });
		});
	}

	componentWillUnmount() {
		this.fbChangeRef.off("value", this.state.listener);
	}

	render() {
		return (
			<Layout.Content className="logs-content">
				<div className="page-contents">
					<div className="page-titleContainer">
						<h1 className="page-title1">Logs</h1>
					</div>
					<div className="logs-listWrapper">
						{this.state.loading ? (
							<div style={{ textAlign: "center" }}>
								<Spin size="large" tip="Loading..." />
							</div>
						) : (
							<List
								pagination={{
									onChange: (page) => {
										console.log(page);
									},
									pageSize: 3,
								}}
								itemLayout="vertical"
								footer={
									<>
										<p>
											Updated once per hour.
											<br />
											Displayed in your local time (
											{Intl.DateTimeFormat().resolvedOptions().timeZone})
										</p>
									</>
								}
								dataSource={this.state.data}
								renderItem={(item) => (
									<List.Item>
										<List.Item.Meta title={item.time} />
										{Object.keys(item).map((key) => {
											var topic = item[key];
											if (topic.length != 0 && key !== "time") {
												return (
													<>
														<p className="logs-topicName">
															{this.state.names[key]}
														</p>
														<Timeline mode="left">
															{topic.map((item) => {
																return (
																	<>
																		<Timeline.Item
																			dot={function () {
																				if (topic[0] === "added") {
																					return (
																						<PlusCircleOutlined className="logs-timelineDotAdd" />
																					);
																				} else if (topic[0] === "changed") {
																					return (
																						<MinusCircleOutlined className="logs-timelineDotChange" />
																					);
																				} else if (topic[0] === "removed") {
																					return (
																						<CloseCircleOutlined className="logs-timelineDotRemove" />
																					);
																				}
																			}}
																		>
																			{topic[1]}
																		</Timeline.Item>
																	</>
																);
															})}
														</Timeline>
													</>
												);
											} else {
												return;
											}
										})}

										<p>Seats</p>
										<Timeline mode="left">
											<Timeline.Item
												dot={
													<PlusCircleOutlined className="logs-timelineDotAdd" />
												}
											>
												Seats for 1111 change from <strong>1</strong> to{" "}
												<strong>0</strong> (Fall 2020, MATH 152)
											</Timeline.Item>
											<Timeline.Item
												dot={
													<MinusCircleOutlined className="logs-timelineDotChange" />
												}
											>
												sfasdf
											</Timeline.Item>
											<Timeline.Item
												dot={
													<CloseCircleOutlined className="logs-timelineDotRemove" />
												}
											>
												sfasdf
											</Timeline.Item>
										</Timeline>
									</List.Item>
								)}
							></List>
						)}
					</div>
				</div>
			</Layout.Content>
		);
	}
}
export default Logs;
