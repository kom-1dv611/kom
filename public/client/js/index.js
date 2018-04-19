let original = $(".container").children();


$(".dropdown-item").click(function() {
    startFilter($(this).text());
});

function startFilter(f) {
    reset();
    let filtered = filter(f);
    let sorted = sort(filtered);
    $(".container").children().remove();
    addNew(sorted);
}

function reset() {
    $(".container").children().remove();
    $(original).each(function(index, val) {
        $(".container").append(this);
    });
}

function addNew(rows) {
    let row, col;
    for(let i = 0; i < rows.length; i++) {
        row = $("<div>").appendTo($(".container"));
        row.addClass("row top-buffer animated fadeInUp");
        for(let j = 0; j < rows[i].cols.length; j++) {
            original.push(rows[i].cols[j]);
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
    $(".location").each(function(index, val) {
        if($(this).text() == condition) {
            filtered.push($(this).parent().parent().parent().parent());
        }
    });
    return filtered;
}