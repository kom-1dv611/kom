let container = $(".container");
let locs = $(".location");
let filterBy = "Kalmar Nyckel";
let filtered = filter(filterBy);
container.children().remove();
let sorted = sort(filtered);


addNew(sorted);


function addNew(rows) {
    for(let i = 0; i < rows.length; i++) {
        let row = $("<div>").appendTo(container);
        row.addClass("row top-buffer");
        for(let j = 0; j < rows[i].cols.length; j++) {
            row.append(rows[i].cols[j]);
        }
    }
}

function sort(rooms) {
    let size = Math.ceil(rooms.length / 3);
    let rows = [];
    for(let i = 0; i < size; i++) {
        rows.push({})
        rows[i].cols = [];
        for(let j = i * 3; j < (i * 3) + 3; j++) {
            if(rooms[j] != undefined) {
                rows[i].cols.push(rooms[j]);
            }
        }
    }
    return rows;
}

function filter(condition) {
    let filtered = [];
    locs.each(function(index, val) {
        if($(this).text() == filterBy) {
            filtered.push($(this).parent().parent().parent().parent());
        }
    });
    return filtered;
}