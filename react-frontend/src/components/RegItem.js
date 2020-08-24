import React, { Component } from "react";
import PropTypes from "prop-types";
import { Descriptions } from "antd";
import "./RegItem.css";

class RegItem extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {}

	render() {
		var quarter = this.props.data.quarter;

		var location = "";
		// remove subject if course is in path
		if (this.props.data.course === "") {
			location = "Avalaible Quarters";
		} else if (this.props.data.subject === "") {
			location = [quarter, this.props.data.course].join(", ");
		} else if (this.props.data.section !== "") {
			location = [
				quarter,
				this.props.data.course,
				"Section " + this.props.data.section,
			].join(", ");
		} else {
			location = [quarter, this.props.data.course].join(", ");
		}

		return (
			<div className="regItem-wrapper">
				<Descriptions title={location}>
					<Descriptions.Item label="Quarter">{quarter}</Descriptions.Item>
					<Descriptions.Item label="Subject">
						{this.props.data.subject}
					</Descriptions.Item>
					<Descriptions.Item label="Course">
						{this.props.data.course}
					</Descriptions.Item>
					{this.props.data.section === "" ? (
						<></>
					) : (
						<>
							<Descriptions.Item label="Section">
								{this.props.data.section}
							</Descriptions.Item>
							<Descriptions.Item label="Notify on Instructor Change">
								{this.props.data.instructor === true ? "Yes" : "No"}
							</Descriptions.Item>
							<Descriptions.Item label="Notify on Available Seats Change">
								{this.props.data.seats !== -1 ? (
									<>Yes, at {this.props.data.seats}</>
								) : (
									"No"
								)}
							</Descriptions.Item>
						</>
					)}
				</Descriptions>
				<p>
					<strong>
						{this.props.data.section === "" ? (
							<>
								You will be notified if a section is added or removed from{" "}
								{this.props.data.course}.
							</>
						) : (
							<>
								You will be notified if there are changes to Section{" "}
								{this.props.data.section} in {this.props.data.course}.
							</>
						)}
					</strong>
				</p>
			</div>
		);
	}
}

RegItem.propTypes = {
	data: PropTypes.object.isRequired,
	pushKey: PropTypes.string.isRequired,
	uid: PropTypes.string.isRequired,
};

export default RegItem;
