import React, { Component } from 'react';
import Modal from "./enterDateTime";

class book extends Component {
  render() {
    return (
        <div className="col-md-auto">
            <button title="Book this room at a later date" id="bookLater" className="btn btn-dark" type="button" data-toggle="modal" data-target="#bookAt">Book later</button>
            <Modal/>
        </div>
    );
  }
}

export default book;

