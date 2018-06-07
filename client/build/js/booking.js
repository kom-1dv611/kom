function saveUser () {
  let person = prompt('Please enter your username:')

  if (person == null || person == '') {
    console.log('spara ej')
  } else {
    let x = document.createElement('input')
    x.setAttribute('type', 'text')
    x.setAttribute('value', person)
    x.setAttribute('name', 'username')
    x.setAttribute('id', 'username')
    let form = document.getElementById('bookingForm')
    form.appendChild(x)
  }
}
