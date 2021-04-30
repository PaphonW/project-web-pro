import React from 'react'
import {Link} from 'react-router-dom'
import {getCookie} from './../scripts/getCookie'

class Header extends React.Component {

    async isExpired() {
        const res = await(await fetch("http://localhost:3030/login", {
            method: "GET",
            headers: {
                'Authorization': 'Bearer ' + getCookie('token'),
            }
        }
        )).json();

        if(getCookie('auth')==='true' && res.auth) {
            document.getElementById("loginStatus").innerHTML = `<p class="inline-block text-sm leading-none border rounded text-black border-white hover:border-transparent hover:text-teal mt-4 lg:mt-0 mr-4">Username: ${JSON.parse(getCookie('user'))[0].username} <span class="text-blue-600">[${getCookie('country')}]</span></p>`;
            let classInfo = document.getElementById("logoutBtn").getAttribute('class').replace('hidden','inline-block')
            document.getElementById("logoutBtn").setAttribute('class', classInfo)
        }
        else {
            document.cookie = `auth=false`;
        }
    }
    
    menu() {
        var x = document.getElementById('bur');
        if(x.style.display === 'none'){
          x.style.display = 'block'
        }else{
          x.style.display = 'none'
        }
      }
    
    async logout() {
            const res = await (await fetch("http://localhost:3030/logout")).json();
            document.cookie = `auth=${res.auth}`;
            document.cookie = `token=${res.token}`;
            document.cookie = `user=${JSON.stringify(res.result)}`;
            document.cookie = `country=`;
            sessionStorage.removeItem('data');
            sessionStorage.removeItem('searchInfo');
            alert("You are logged out.");
            window.location.reload();
    }

    componentDidMount() {
        this.isExpired()
    }

    render() {
        return <header>
                    <nav className="w-full flex items-center justify-between flex-wrap bg-teal p-6 top-0 bg-white border-b fixed">
                        <div className="flex items-center flex-no-shrink text-black mr-6">
                        <a href="http://127.0.0.1:5500/public/" className="font-semibold text-xl tracking-tight">Wong IT</a>
                        </div>
                        <div className="block lg:hidden">
                        <button className="flex items-center px-3 py-2 border rounded text-teal-lighter border-teal-light hover:text-white hover:border-white" onClick={this.menu}>
                            <svg className="h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
                        </button>
                        </div>
                        <div className="w-full lg:block flex-grow lg:flex lg:items-center lg:w-auto hidden" id="bur">
                        <div className="text-sm lg:flex-grow">
                            <a href="http://127.0.0.1:5500/public/search.html" className="block mt-4 lg:inline-block lg:mt-0 text-teal-lighter lg:hover:text-blue-400 mr-4 lg:border-l lg:pl-5 lg:border-gray-400">
                            Find Product
                            </a>
                            <a href="http://127.0.0.1:5500/public/about.html" className="block mt-4 lg:inline-block lg:mt-0 text-teal-lighter lg:hover:text-blue-400 mr-4 lg:border-l lg:pl-5 lg:border-gray-400">
                            About
                            </a>
                            <Link to="/" className="block mt-4 lg:inline-block lg:mt-0 text-teal-lighter lg:hover:text-blue-400 mr-4 lg:border-l lg:pl-5 lg:border-gray-400">
                            Dashboard
                            </Link>
                        </div>
                        <div id="loginStatus">
                            <Link to="/login" className="inline-block text-sm leading-none border rounded text-black border-white hover:border-transparent hover:text-teal hover:bg-white mt-4 lg:mt-0 mr-4">Sign in</Link>
                        </div>
                        <div id="sideLogin">
                            <button id="logoutBtn" onClick={this.logout} className="hidden text-sm leading-none border rounded text-black border-white hover:border-transparent hover:text-teal mt-4 lg:mt-0 lg:hover:bg-gray-200 lg:border-gray-300 lg:py-2 lg:px-4">Logout</button>
                        </div>  
                        </div>
                    </nav>
                </header>
    }
}

export default Header