function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

// function isLogined() {

// }

async function logout() {
    const res = await (await fetch("http://localhost:3030/logout")).json();
    document.cookie = `auth=${res.auth}`;
    document.cookie = `token=${res.token}`;
    document.cookie = `user=${JSON.stringify(res.result)}`;
    document.cookie = `country=`;
    sessionStorage.removeItem('data');
    sessionStorage.removeItem('searchInfo');
    alert("You are logged out.");
    window.location.href = 'login.html';
}