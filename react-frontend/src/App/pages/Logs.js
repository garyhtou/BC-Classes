import React, { Component } from "react";
import { Layout, Timeline, List, Spin } from "antd";
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
					var fullDate = date + " at " + time;

					var changeItemTemplate = {
						time: fullDate,
						change: true,
						quarters: [],
						subjects: [],
						courses: [],
						sections: [],
						instructor: [],
						seats: [],
					};

					var noChangeTemplate = {
						time: fullDate,
						change: false,
					};

					var changeItem = JSON.parse(JSON.stringify(changeItemTemplate));

					for (var topic in pushObj.changes) {
						var topicObj = pushObj.changes[topic];

						for (var topicItem in topicObj) {
							var topicItemObj = topicObj[topicItem];
							console.log(topic);
							console.log(topicItemObj);

							var locationLast = topicItemObj[2][topicItemObj[2].length - 1];
							if (locationLast === undefined) {
								locationLast = "avalaible quarters";
							}

							var location = "";
							// remove subject if course is in path
							if (topic === "quarter") {
								location = locationLast;
							} else if (topic === "subject") {
								location = topicItemObj[2].join(", ");
							} else if (
								topic === "section" ||
								topic === "instructor" ||
								topic === "seats"
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

							if (topicItemObj[0] === "changed") {
								var changeNew = topicItemObj[1][0];
								var changeOld = topicItemObj[1][1];

								if (topic === "instructor") {
									if (topicItemObj[1][0] === "") {
										changeNew = "Staff";
									}
									if (topicItemObj[1][1] === "") {
										changeOld = "Staff";
									}
								}

								changeItem[topic].push([
									"changed",
									"Changed from <strong>" +
										changeOld +
										"</strong> to <strong>" +
										changeNew +
										"</strong> for " +
										location +
										".",
								]);
							} else if (topicItemObj[0] === "added") {
								changeItem[topic].push([
									"added",
									"<strong>" +
										topicItemObj[1] +
										"</strong> was <strong>added</strong> to " +
										location +
										".",
								]);
							} else if (topicItemObj[0] === "removed") {
								changeItem[topic].push([
									"removed",
									"<strong>" +
										topicItemObj[1] +
										"</strong> was <strong>removed</strong> from " +
										location +
										".",
								]);
							}
							console.log(changeItem[topic][changeItem[topic].length - 1]);
						}
					}

					if (
						JSON.stringify(changeItem) !== JSON.stringify(changeItemTemplate)
					) {
						data.push(changeItem);
					} else {
						data.push(noChangeTemplate);
					}
				}
			}
			console.log(data);
			this.setState({
				loading: false,
				data: data.reverse(),
				fbListener: listener,
			});
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
							//TODO REVERSE
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
											if (
												topic.length !== 0 &&
												key !== "time" &&
												key !== "change"
											) {
												// console.log(key);
												// console.log(topic);
												return (
													<>
														<p className="logs-topicName">
															{this.state.names[key]}
														</p>
														<Timeline mode="left">
															{topic.map((message) => {
																return (
																	<Timeline.Item
																		dot={(function () {
																			if (message[0] === "added") {
																				return (
																					<PlusCircleOutlined className="logs-timelineDotAdd" />
																				);
																			} else if (message[0] === "changed") {
																				return (
																					<MinusCircleOutlined className="logs-timelineDotChange" />
																				);
																			} else if (message[0] === "removed") {
																				return (
																					<CloseCircleOutlined className="logs-timelineDotRemove" />
																				);
																			}
																		})()}
																	>
																		{
																			<>
																				<div
																					dangerouslySetInnerHTML={{
																						__html: message[1],
																					}}
																				></div>
																			</>
																		}
																	</Timeline.Item>
																);
															})}
														</Timeline>
													</>
												);
											} else if (key === "change" && item.change === false) {
												return <p>No changes.</p>;
											} else {
												return <></>;
											}
										})}
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
