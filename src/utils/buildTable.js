'use strict';

//Builds table of grouprooms 
module.exports = function(groupRooms) {
    groupRooms.sort((a, b) => a.room.name.localeCompare(b.room.name))
    let rowSize = 4;
    let size = Math.ceil(groupRooms.length / rowSize);
    let rows = [];
    for (let i = 0; i < size; i++) {
        rows.push({})
        rows[i].cols = [];
        for (let j = i * rowSize; j < (i * rowSize) + rowSize; j++) {
            if (groupRooms[j] != undefined) {
                rows[i].cols.push(groupRooms[j]);
            }
        }
    }
    return rows;
}
