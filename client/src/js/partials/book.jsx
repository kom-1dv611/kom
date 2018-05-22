import React, { Component } from 'react';
import Modal from "./bookModal";
import CancelModal from "./cancelModal";

class book extends Component {
  bookLater() {
    return(
    <div className="col-md-auto">
      <button title="Book this room at a later date" id="bookLaterButton" className="btn btn-dark" type="button" data-toggle="modal" data-target="#bookLater">Book Later</button>
      <Modal room={this.props.room} bookLater={true} toggler="bookLater"/>
    </div>);
  }

  bookNow() {
    return(
      <div className="col-md-auto">
        <button title="Book this room now" id="bookNowButton" className="btn btn-dark" type="button" data-toggle="modal" data-target="#bookNow">Book Now</button>
        <Modal room={this.props.room} bookLater={false} toggler="bookNow"/>
      </div>);
  }

  cancel() {
    return (
    <div className="col-md">
      <button id="cancelButton" title="Cancel current booking" type="button" className="btn btn-dark" data-toggle="modal" data-target="#cancelModal">Cancel Booking</button>
      <CancelModal name={this.props.room}/>
    </div>);
  }
  
  render() {
      return(
      <div className="row pb-0">
        {this.bookLater()}
        {this.props.available ? this.bookNow() : this.cancel()}
      </div>);
  }
}

export default book;

