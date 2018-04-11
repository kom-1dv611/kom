var clock;
var animation = "animated fadeInDown";
var animationTime = "0.7s";

function getLength(number) {
    return number.toString().length
}

function ensureFormat(time) {
    if(getLength(time) == 1) {
        time = "0" + time.toString()
    }
    return time;
}

function makeSpans(parent) {
    for(let i = 0; i < 8; i++) {
        parent.append(`<span></span>`);
    }
}

function Clock(parent) {
    this.parent = parent;

    $(parent).attr("data-wow-duration", animationTime);
    makeSpans(parent);

    setInterval(this.displayTime.bind(this), 1000); //updates every second
    this.displayTime(); //starts clock
}

Clock.prototype.displayTime = function() {
    console.log(this);
    let time = this.getTime()
    let toDisplay = `${this.hours}:${this.minutes}:${this.seconds}`;
    let child;
    for(let i = 0; i < toDisplay.length; i++) {
        child = $(this.parent.children()[i]);
        this.updateSpan(child, toDisplay[i])
    }
}

Clock.prototype.getTime = function() {
    let now = new Date();
    this.hours = ensureFormat(now.getHours());
    this.minutes = ensureFormat(now.getMinutes());
    this.seconds = ensureFormat(now.getSeconds());
}

Clock.prototype.updateSpan = function(child, update) {
    if(child.text() != update) {
        child.addClass(animation);
        setTimeout(this.removeAnimation, 900, child);
        child.text(update);
    }
}

Clock.prototype.removeAnimation = function(child) {
    $(child).removeClass(animation);
}

clock = new Clock($("#clock"));