import React, { Component } from 'react';

class room extends Component {
    select() {
        return null;
    }
    render() {
        let room = this.props.room;
        console.log(room);
        if(room.available) {
            room = room.room;
            return (
                <div className="card text-center">
                    <div className="card-body">
                        <h5 className="card-title" onClick={this.select}>{room.name}</h5>
                        <p className="location">{room.location}</p> 
    
                        <h6 className="card-subtitle mb-2 text-success">Available</h6>
                    </div>
                </div>);
        } else {
            room = room.room;
            return (
                <div className="card text-center">
                    <div className="card-body">
                        <h5 className="card-title">{room.name}</h5>
                        <p className="location">{room.location}</p> 
    
                        <h6 className="card-subtitle mb-2 text-muted">In use</h6>
                    </div>
                </div>);
        }
    }
}

export default room;
