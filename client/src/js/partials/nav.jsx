import React, { Component } from 'react';
import Modal from "./enterDateTime";

class nav extends Component {
  render() {
    return (
      <nav class="">
        <div class="">
          <ol class="breadcrumb">
            <li class="breadcrumb-item active"><a href="/"><i class="fas fa-home fa-fw"></i>{this.props.location}</a></li>
          </ol>
          <div id="filter" class="btn-group dropleft">
            <button type="button" class="btn btn-dark btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Location
            </button>
            <div class="dropdown-menu">
              <h6 class="dropdown-header">Location</h6>
              <button class="dropdown-item" type="button">All</button>
              <button class="dropdown-item" type="button">Kalmar Nyckel</button>
              <button class="dropdown-item" type="button">Sjöfartshögskolan</button>
              <button class="dropdown-item" type="button">Kocken</button>
              <button class="dropdown-item" type="button">Universitetsbiblioteket</button>
              <button class="dropdown-item" type="button">Storken</button>
              <button class="dropdown-item" type="button">Norrgård</button>
            </div>
          </div>
          <img src="/imgs/url.png" alt="url"/>
        </div>
      </nav>
    );
  }
}

export default nav;

