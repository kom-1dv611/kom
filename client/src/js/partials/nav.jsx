import React, { Component } from 'react';
import Modal from "./enterDateTime";

class nav extends Component {
  location() {
    let filter = this.props.filter;
    if(filter === "true") {
      return(
        <div id="filter" className="btn-group dropleft">
          <button type="button" className="btn btn-dark btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Location
          </button>
          <div className="dropdown-menu">
            <h6 className="dropdown-header">Location</h6>
            <button className="dropdown-item" type="button">All</button>
            <button className="dropdown-item" type="button">Kalmar Nyckel</button>
            <button className="dropdown-item" type="button">Sjöfartshögskolan</button>
            <button className="dropdown-item" type="button">Kocken</button>
            <button className="dropdown-item" type="button">Universitetsbiblioteket</button>
            <button className="dropdown-item" type="button">Storken</button>
            <button className="dropdown-item" type="button">Norrgård</button>
          </div>
        </div>);
    } else {
      return "";
    }
  }
  render() {
    return (
      <nav>
        <div>
          <ol className="breadcrumb">
            <li className="breadcrumb-item active"><a href="/"><i className="fas fa-home fa-fw"></i>{this.props.location}</a></li>
          </ol>
          {this.location()}
          <img src="/imgs/url.png" alt="url"/>
        </div>
      </nav>
    );
  }
}

export default nav;

