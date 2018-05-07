import React, { Component } from 'react';
import Modal from "./bookModal";

class book extends Component {
  render() {
    console.log(this.props.room);
    return (
        <div className="col-md-auto">
            <button title="Book this room at a later date" id="bookLaterButton" className="btn btn-dark" type="button" data-toggle="modal" data-target="#bookLater">Book Later</button>
            <Modal room={this.props.room} bookLater={true} toggler="bookLater"/>
            <button title="Book this room at a later date" id="bookNowButton" className="btn btn-dark" type="button" data-toggle="modal" data-target="#bookNow">Book Now</button>
            <Modal room={this.props.room} bookLater={false} toggler="bookNow"/>
        </div>
    );
  }
}

export default book;

