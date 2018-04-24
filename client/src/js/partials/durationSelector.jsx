import React, { Component } from 'react';

class duration extends Component {
  render() {
    return (
      <label className="btn btn-dark" title={"Book this room for " + this.props.duration + "hours(s) starting now"}>
          <input type="radio"  value={this.props.duration} name="duration" />
          {this.props.duration} hour(s)
      </label>
    );
  }
}

export default duration;

