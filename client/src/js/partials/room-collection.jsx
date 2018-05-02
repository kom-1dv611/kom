import React, { Component } from 'react';
import {connect} from "react-redux"; //read
import Room from "./room"

class roomCollection extends Component {
    structure(target) {
        let rows = target.map(function (row, i) {
            let cols = [];
            row.cols.map(function(col, j) {
                return cols.push(<div key={"r" + i + "c" + j} className="col"><Room key={"r" + i + "c" + j + "r"} room={row.cols[j]}/></div>);
            });
            return <div key={"r" + i} className="row top-buffer mb-4">{cols}</div>
        });
        return rows;
    }

    sort(rooms) {
        let size = Math.ceil(rooms.length / 3);
        let rows = [];
        for(let i = 0; i < size; i++) {
            rows.push({})
            rows[i].cols = [];
            for(let j = i * 3; j < (i * 3) + 3; j++) {
                if(rooms[j] !== undefined) {
                    rows[i].cols.push(rooms[j]);
                }
            }
        }
        return rows;
    }

    render() {
        let rows;

        if(this.props.filter === null) {
            rows = this.structure(this.props.rows.rows)
        } else {
            let total = [];
            let filter = this.props.filter;
            this.props.rows.rows.map(function (row, i) {
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
  
