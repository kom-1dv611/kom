function saveUser() {
    var txt;
    var person = prompt("Please enter your username:");

    if (person == null || person == "") {
        txt = "User cancelled the prompt.";
    } else {
        txt = "Hello " + person + "! How are you today?";
    }
    let x = document.createElement('input')
    x.setAttribute('type', 'text')
    x.setAttribute('value', person)
    x.setAttribute('name', 'username')
    x.setAttribute('id', 'username')
    let form = document.getElementById('bookingForm')
    form.appendChild(x)
}