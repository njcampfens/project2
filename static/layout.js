document.addEventListener('DOMContentLoaded', () => {

  // Set title of the page below the navbar
  document.querySelector('#title').innerHTML = document.title;

  // Login and logout frontend method
  if (localStorage.getItem('USERNAME') === null){
    document.querySelector('#login_logout').innerHTML = 'Login';
  }
  else {
    document.querySelector('#login_logout').innerHTML = 'Logout';
    document.querySelector('#login_logout').onclick = () => {
      localStorage.removeItem('USERNAME');
    };
  }


});
