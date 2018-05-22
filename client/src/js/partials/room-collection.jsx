import React, { Component } from 'react';
import {connect} from "react-redux"; //read
import Room from "./room"

import logo from '../../logo.svg';

class roomCollection extends Component {
    constructor(props) {
        super(props);
        this.state = {rows: this.props.rows.rows}
        this.startTimer = this.startTimer.bind(this);
        this.countDown = this.countDown.bind(this);
    }

    componentDidMount() {
        this.timer = 0;
        this.startTimer();
        this.getRooms().then((rooms) => {
            this.setState(() => {
                return{rows: rooms};
            });
        });
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }
    
    startTimer() {
        if (this.timer === 0) {
            this.timer = setInterval(this.countDown, 5000);
        }
    }


    async getRooms() {
        let rooms = await fetch("/rooms");
        rooms = await rooms.json();
        return rooms["rows"];
    }

    async countDown() {
        let rows = await this.getRooms();
        this.setState(function() {
            return {
                rows: rows
            };
        });
      }

    structure(target) {
        let rows = target.map(function (row, i) {
            let cols = [];
            row.cols.map(function(col, j) {
                return cols.push(<div key={"r" + i + "c" + j} className="col"><Room key={"r" + i + "c" + j + "r"} room={row.cols[j]}/></div>);
            });
            return <div key={"r" + i} className="row mb-4">{cols}</div>
        });
        return rows;
    }

    sort(rooms) {
        let rowSize = 4;
        let size = Math.ceil(rooms.length / rowSize);
        let rows = [];
        for(let i = 0; i < size; i++) {
            rows.push({})
            rows[i].cols = [];
            for(let j = i * rowSize; j < (i * rowSize) + rowSize; j++) {
                if(rooms[j] !== undefined) {
                    rows[i].cols.push(rooms[j]);
                }
            }
        }
        return rows;
    }

    render() {
        let rows;
        if(this.props.filter === null || this.props.filter == "All") {
            rows = this.structure(this.state.rows)
        } else {
            let total = [];
            let filter = this.props.filter;
            console.log(filter);
            this.state.rows.map(function (row, i) {
                let temp = row.cols.filter(col => col.room.location === filter);
                total = total.concat(temp);
                return true;
            });
            rows = this.sort(total);
            rows = this.structure(rows)
        }

        return (
            <div className="roomContainer">
                {rows}
            </div>
        );
    }
    
}

function read(db) {
    return{
      filter: db.filterSelect,
    };
  }
  
  
export default connect(read)(roomCollection);
  
