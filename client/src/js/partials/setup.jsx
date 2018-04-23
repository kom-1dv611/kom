import React, { Component}  from 'react';
import {connect} from "react-redux"; //read
import {bindActionCreators} from "redux"; //write

import event from "../actions/setup"

class setup extends Component {
    render() {
        return(
            <div id="book">
                <div className="row justify-content-center">
                <div className="col-md-auto">
                    <button className="btn btn-dark" onClick={ () => this.props.setup("overall") }>Overview</button>
                </div>
                <div className="col-md-auto">
                    <button className="btn btn-dark" onClick={ () => this.props.setup("specific") }>specific</button>
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
    setup: event
}, dispatch);
}
  
export default connect(read, write)(setup);
