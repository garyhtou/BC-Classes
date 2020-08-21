import React, { Component } from "react";
import { Layout, Timeline, List, Spin } from "antd";
import {
	PlusCircleOutlined,
	MinusCircleOutlined,
	CloseCircleOutlined,
	UpCircleOutlined,
	DownCircleOutlined,
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
		var seeAllToggle = {};

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
						seeAllToggle[pushObj.time + topic] = false;

						for (var topicItem in topicObj) {
							var topicItemObj = topicObj[topicItem];

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
									pushObj.time + topic,
									"Changed from <strong>" +
										changeOld +
										"</strong> to <strong>" +
										changeNew +
										"</strong> for " +
										location +
										".",
									changeNew,
									changeOld,
								]);
							} else if (topicItemObj[0] === "added") {
								changeItem[topic].push([
									"added",
									pushObj.time + topic,
									"<strong>" +
										topicItemObj[1] +
										"</strong> was <strong>added</strong> to " +
										location +
										".",
								]);
							} else if (topicItemObj[0] === "removed") {
								changeItem[topic].push([
									"removed",
									pushObj.time + topic,
									"<strong>" +
										topicItemObj[1] +
										"</strong> was <strong>removed</strong> from " +
										location +
										".",
								]);
							}
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
				...seeAllToggle,
			});
		});
	}

	componentWillUnmount() {
		this.fbChangeRef.off("value", this.state.listener);
	}

	toggleSeeAll(id) {
		this.setState({ [id]: !this.state[id] });
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
							<>
								<List
									pagination={{
										onChange: (page) => {
											console.log("page: " + page);
										},
										pageSize: 6,
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
											<List.Item.Meta
												className="log-timeTitle"
												title={item.time}
											/>
											{Object.keys(item).map((key) => {
												var topic = item[key];
												if (
													topic.length !== 0 &&
													key !== "time" &&
													key !== "change"
												) {
													return (
														<>
															<p className="logs-topicName">
																{this.state.names[key]}
															</p>
															<Timeline mode="left">
																{topic.slice(0, 3).map((message) => {
																	return (
																		<Timeline.Item
																			dot={(function () {
																				if (message[0] === "added") {
																					return (
																						<PlusCircleOutlined className="logs-timelineDotAdd" />
																					);
																				} else if (message[0] === "changed") {
																					if (key === "seats") {
																						if (message[3] > message[4]) {
																							return (
																								<UpCircleOutlined className="logs-timelineDotChangeUp" />
																							);
																						} else {
																							return (
																								<DownCircleOutlined className="logs-timelineDotChangeDown" />
																							);
																						}
																					}
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
																							__html: message[2],
																						}}
																					></div>
																				</>
																			}
																		</Timeline.Item>
																	);
																})}
																{topic.slice(3).map((message) => {
																	if (this.state[message[1]]) {
																		return (
																			<Timeline.Item
																				dot={(function () {
																					if (message[0] === "added") {
																						return (
																							<PlusCircleOutlined className="logs-timelineDotAdd" />
																						);
																					} else if (message[0] === "changed") {
																						if (key === "seats") {
																							if (message[3] > message[4]) {
																								return (
																									<UpCircleOutlined className="logs-timelineDotChangeUp" />
																								);
																							} else {
																								return (
																									<DownCircleOutlined className="logs-timelineDotChangeDown" />
																								);
																							}
																						}
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
																								__html: message[2],
																							}}
																						></div>
																					</>
																				}
																			</Timeline.Item>
																		);
																	}
																	return;
																})}
																{topic.length > 3 ? (
																	<Timeline.Item
																		dot={function () {
																			if (this.state[topic[0][1]]) {
																				return (
																					<UpCircleOutlined className="logs-timelineDotSeeAll" />
																				);
																			} else
																				return (
																					<DownCircleOutlined className="logs-timelineDotHide" />
																				);
																		}.bind(this)()}
																		onClick={() => {
																			this.toggleSeeAll(topic[0][1]);
																		}}
																	>
																		<p className="log-seeAll">
																			{!this.state[topic[0][1]]
																				? "see all..."
																				: "hide..."}
																		</p>
																	</Timeline.Item>
																) : (
																	<></>
																)}
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
							</>
						)}
					</div>
				</div>
			</Layout.Content>
		);
	}
}
export default Logs;
