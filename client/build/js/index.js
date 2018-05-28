let original = $(".roomContainer").children();


$(".dropdown-item").click(function() {
    if($(this).text() != "All") {
        startFilter($(this).text());
    } else {
        reset();
        let filtered = filter();
        let sorted = sort(filtered);
        $(".roomContainer").children().remove();
        addNew(sorted);
    }
});

function startFilter(f) {
    reset();
    let filtered = filter(f);
    let sorted = sort(filtered);
    $(".roomContainer").children().remove();
    addNew(sorted);
}

function reset() {
    $(".roomContainer").children().remove();
    $(original).each(function(index, val) {
        $(".roomContainer").append(this);
    });
}

function addNew(rows) {
    let row, col;
    for(let i = 0; i < rows.length; i++) {
        row = $("<div>").appendTo($(".roomContainer"));
        row.addClass("row top-buffer mb-4 animated fadeInUp");
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
        if(condition) {
            if($(this).text() == condition) {
                filtered.push($(this).parent().parent().parent().parent());
            }
        } else {
            filtered.push($(this).parent().parent().parent().parent());
        }
        
    });
    return filtered;
}