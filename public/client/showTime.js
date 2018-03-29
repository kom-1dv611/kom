function getLength(number) {
    return number.toString().length
}

function ensureFormat(time) {
    if(getLength(time) == 1) {
        time = "0" + time.toString()
    }
    return time;
}

function getTime() {
    let now = new Date()
    let toReturn = {hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds()};

    let keys = Object.keys(toReturn);
    let values = Object.values(toReturn);

    keys.forEach(function(key, i) {
        toReturn[key] = ensureFormat(values[i]);
    });

    return toReturn
}

let header;

$(document).ready(function() {
    header = $("#clock");
    displayTime()
});

function makeSpans(parent) {
    for(let i = 0; i < 8; i++) {
        parent.append(`<span data-wow-duration="0.7s"></span>`);
    }
}

function updateSpan(child) {
    if(child.text() != toDisplay[i]) {
        child.addClass("animated fadeInDown");
        setTimeout(removeAnimation, 900, child);
        child.text(toDisplay[i]);
    }
}

function displayTime() {
    let time = getTime()
    let toDisplay = `${time.hours}:${time.minutes}:${time.seconds}`;
    let child;
    for(let i = 0; i < toDisplay.length; i++) {
        child = $(parent.children()[i]);
        updateSpan(child)
    }
}

function removeAnimation(child) {
    $(child).removeClass("animated fadeInDown");
}

setInterval(displayTime, 1000);