import React, { Component } from 'react';
import {connect} from "react-redux"; //read
import {bindActionCreators} from "redux"; //write
import event from "../actions/filterClick";


class nav extends Component {
  generateButton(text) {
    return (<button className="dropdown-item" type="button" onClick={() => {
		this.props.filterClick(text);
	}}>{text}</button>);
  }

  search() {
    let filter = this.props.filter;
    if(filter === "true") {
      return(
          <div>
            <input type="text" id="search" class="form-control text-center" placeholder="Search" maxLength="8"/>
          </div>
        );
    } else{
      return "";
    }
  }

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
            {this.generateButton("All")}
            {this.generateButton("Kalmar Nyckel")}
            {this.generateButton("Sjöfartshögskolan")}
            {this.generateButton("Kocken")}
            {this.generateButton("Universitetsbiblioteket")}
            {this.generateButton("Storken")}
            {this.generateButton("Norrgård")}
          </div>
        </div>);
    }
  }
  render() {
    return (
      <nav className="animated fadeInDown">
        <h4>Linnéuniversitetet</h4>
        <div className="text-center">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active"><a href="/"><i className="fas fa-home fa-fw"></i>{this.props.location}</a></li>
          </ol>
          {this.search()}
          {this.location()}
        </div>
      </nav>
    );
  }
}

function read(db) {
    return{};
  }
  
  function write(dispatch) {
    return bindActionCreators({
      filterClick: event
    }, dispatch);
  }
  
  export default connect(read, write)(nav);

