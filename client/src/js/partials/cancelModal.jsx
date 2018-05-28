import React, { Component } from 'react';
import {connect} from "react-redux"; //read
import {bindActionCreators} from "redux"; //write

import cancel from "../actions/cancelBooking";

import $ from "jquery";

class cancelModal extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
                
    componentDidMount() {
        $(document ).ready(() => {
            $("#cancelConfirm").off();
            $("#cancelConfirm").on("click", async() => {
                this.onCancelClick();
            });
        });
    }

    async onCancelClick() {
        let name = this.props.name;
        let user = $("#cancelName").val();
        if(user !== "") {
            this.props.cancel({name: name, user: user});
        }
    }

    header() {
        return(
            <div className="modal-header">
                <h5 className="modal-title">Cancel As</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        );
    }

    body() {
        return(
            <div className="modal-body">
                <label><i className="fas fa-user-times"></i>Cancel As:</label>
                <input id="cancelName" type="text" name="user" className="form-control" placeholder="Username" minLength="3" maxLength="12"/>
            </div>
        );
    }

    footer() {
        return(
            <div className="modal-footer">
                <button id="cancelConfirm" type="button" className="btn btn-dark confirm" data-dismiss="modal">Confirm</button>
            </div>
        );
    }

    render() {
        return (
            <div className="modal fade" id="cancelModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog" role="document">
                <div className="modal-content text-center">
                    {this.header()}
                    {this.body()}
                    {this.footer()}
                </div>
            </div>
        </div>
        );
    }
}

function read(db) {
    return{};
}
  
function write(dispatch) {
    return bindActionCreators({
        cancel: cancel
    }, dispatch);
}

export default connect(read, write)(cancelModal);
  

