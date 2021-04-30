import React from 'react'
import {getCookie} from './../scripts/getCookie'

class manageUser extends React.Component {

    constructor() {
        super()
        this.state = {
            info: "",
            city: "",
            removeId: "",
            updateId: "",
            username: "",
            password: "",
            email: "",
            telNumber: "",
            address: "",
            registCity: "",
            postcode: "",
        }
        this.handleChange = this.handleChange.bind(this)
        this.searchUser = this.searchUser.bind(this)
        this.removeItem = this.removeItem.bind(this)
        this.logout = this.logout.bind(this)
        this.changeRole = this.changeRole.bind(this)
        this.register = this.register.bind(this)
    }

    handleChange(e) {
        let value = e.target.value
        let name = e.target.name
        this.setState({
            [name]: value,
        })
    }

    async searchUser(e) {

        let info = this.state.info
        let city = this.state.city
    
        let url = `http://localhost:3030/getUser`;
    
        if(info) {
            url += `?info=${info}`;
            if(city) {
                url += `&city=${city}`;
            }
        }
        else if(city) {
            url += `?city=${city}`;
        }
    
        // Check Are there any user data in cookie.
        // If no that means, user is not login yet.
        // This is not a good condition enough but I just noticed the bug. Then I am lazy to fix all conditons.
        if(!JSON.parse(getCookie('user'))) {
            alert("Please login.");
            return;
        }
    
        const res = await (await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getCookie('token'),
                'role': JSON.parse(getCookie('user'))[0].role,
            }
        })).json();
        if(!res.noUser && res.err === false) {
            let output = ``;
            res.result.forEach(user => {
                output += 
                `
                <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
                    <td class="py-3 px-6 text-left">
                        <div class="flex items-center">${user.id}</div>
                    </td>
                    <td class="py-3 px-6 text-left">
                        <div class="flex items-center">${user.username}</div>
                    </td>
                    <td class="py-3 px-6 text-left">${user.role}</td>
                    <td class="py-3 px-6 text-left">${user.email}</td>
                    <td class="py-3 px-6 text-left">${user.phone}</td>
                    <td class="py-3 px-6 text-left max-w-xs">${user.address}</td>
                    <td class="py-3 px-6 text-left">${user.city}</td>
                    <td class="py-3 px-6 text-left">${user.postcode}</td>
                </tr>
                `;
            });
            document.getElementById("itemShowcase").innerHTML = output;
        }
        else if(res.noProduct){
            document.getElementById("itemShowcase").innerHTML = `No user`;
        }
        else {
            alert("Please login as admin.");
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

    async removeItem(e) {
        e.preventDefault();

        let id = this.state.removeId

        const res = await (await fetch("http://localhost:3030/removeUser", {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getCookie('token'),
                'role': JSON.parse(getCookie('user'))[0].role,
            },
            body: JSON.stringify({id})
        })).json();
        this.setState({
            "removeId": "",
        })
        alert(res.message);
        this.searchUser();
        if(JSON.parse(getCookie('user'))[0].id === parseInt(id,10)) this.logout();
    }

    async changeRole(e) {
        e.preventDefault();

        let id = this.state.updateId
        const response = await (await fetch("http://localhost:3030/getRole?id=" + id, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getCookie('token'),
                'role': JSON.parse(getCookie('user'))[0].role,
            }
        })).json();
        let value = response.role
        
        const res = await (await fetch("http://localhost:3030/changeRole", {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getCookie('token'),
                'role': JSON.parse(getCookie('user'))[0].role,
            },
            body: JSON.stringify({id: id, value: value})
            })).json();
            this.setState({
                "updateId": "",
            })
            alert(res.message);
            this.searchUser();
            if(JSON.parse(getCookie('user'))[0].id === parseInt(id,10)) this.logout();
      }

    async register() {
        let user = {
          username: this.state.username,
          password: this.state.password,
          email: this.state.email,
          tel: this.state.telNumber,
          address: this.state.address,
          city: this.state.registCity,
          postcode: this.state.postcode,
        }
        const res = await (await fetch("http://localhost:3030/register", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(user)
        })).json();
        console.log(res);
        if(res.registered) {
          alert("Insert successfully");
        }
        else {
          alert(res.message)
        }
    }

    showInsertBox() {
        if(document.getElementById("insertBox").getAttribute("class").includes("hidden")) {
          document.getElementById("insertBox").setAttribute("class","m-6");
          document.getElementById("showInsertBtn").innerHTML = "Hide insert menu";
        }
        else {
          document.getElementById("insertBox").setAttribute("class","m-6 hidden");
          document.getElementById("showInsertBtn").innerHTML = "Show insert menu";
        }
    }

    render() {
        return <main className="container-fluid w-full h-screen flex mt-14">
                    <section className="min-w-full h-screen p-10 md:p-12">
                        <h1 className="pb-3 text-xl">
                            <strong>User Management</strong>
                        </h1>
                        <div className="flex justify-center p-1">
                            <input className="w-2/6 justify-center border rounded-md bg-gray-200 mr-2 pl-3" type="text" name="info" placeholder="Username..." value={this.state.info} onChange={this.handleChange}/>
                            <input className="justify-center border rounded-md bg-gray-200 mr-2 text-center" type="text" name="city" placeholder="City..." value={this.state.city} onChange={this.handleChange}/>
                            <input className="rounded-md p-1 cursor-pointer" type="button" onClick={this.searchUser} value="Search"/>
                        </div>
                        <div className="flex items-center justify-center overflow-hidden">
                            <div className="w-full lg:w-5/6">
                                <div className="bg-white shadow-md rounded my-6">
                                    <table className="min-w-max w-full table-auto">
                                        <thead>
                                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                                <th className="py-3 px-6 text-left">ID</th>
                                                <th className="py-3 px-6 text-left">Username</th>
                                                <th className="py-3 px-6 text-left">Role</th>
                                                <th className="py-3 px-6 text-left">E-Mail</th>
                                                <th className="py-3 px-6 text-left">Phone</th>
                                                <th className="py-3 px-6 text-left">Address</th>
                                                <th className="py-3 px-6 text-left">City</th>
                                                <th className="py-3 px-6 text-left">Postcode</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-600 text-sm font-light" id="itemShowcase"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="ml-6 mb-4 w-max flex">
                            <form className="w-max md:w-max p-2 h-min bg-white rounded-xl md:shadow-lg md:p-8 mr-6" onSubmit={this.changeRole}>
                                <div className="container grid grid-cols-1">
                                    <div>
                                        <h1 className="text-xl font-bold">Update Role</h1>
                                        <h2 className="pb-3 text-sm text-red-500">* It will switch to another role.<br/><span className="text-black">Example: User will switch to Admin</span></h2>
                                        <label className="pt-3 text-sm">User ID <span className="text-red-500">*</span></label>
                                        <div className="pb-4 pt-2">
                                            <input 
                                                className="min-w-full px-3 py-1 justify-center border rounded bg-gray-200 text-gray-700" 
                                                type="number" name="updateId" required
                                                value={this.state.updateId}
                                                onChange={this.handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <button className="text-sm text-center px-6 py-2 rounded-md border hover:bg-gray-100" type="submit">Switch Role</button>
                                    </div>
                                </div>
                            </form>
                            <form className="w-max md:w-max p-2 h-auto bg-white rounded-xl md:shadow-lg md:p-8" onSubmit={this.removeItem}>
                                <div className="container grid grid-cols-1">
                                    <div>
                                        <h1 className="text-xl font-bold">Remove User</h1>
                                        <h2 className="pb-3 text-sm text-red-500">* It will remove entire of user information.</h2>
                                        <label className="pt-3 text-sm">User ID <span className="text-red-500">*</span></label>
                                        <div className="pb-4 pt-2">
                                            <input 
                                                className="min-w-full px-3 py-1 justify-center border rounded bg-gray-200 text-gray-700" 
                                                type="number" name="removeId" required
                                                value={this.state.removeId}
                                                onChange={this.handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <button className="text-sm text-center px-6 py-2 rounded-md border hover:bg-gray-100" type="submit">Remove</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="ml-6 mb-8 h-1/5">
                            <button className="w-max text-sm text-center px-4 py-2 rounded-md border hover:bg-gray-100" id="showInsertBtn" onClick={this.showInsertBox}>Show insert menu</button>
                            <div className="m-6 hidden" id="insertBox">
                                <form className="w-screen md:w-max p-10 h-min bg-white rounded-xl md:shadow-lg md:p-12" id="innerForm" onSubmit={this.register}>
                                    <div className="container grid grid-cols-1 md:grid-cols-2">
                                        <div>
                                            <h1 className="pb-3 text-xl font-bold">Insert - User</h1>
                                            <label className="pt-3 text-sm">Username <span className="text-red-500">*</span></label>
                                            <div className="pb-4 pt-2">
                                                <input className="min-w-full md:w-96 px-3 py-1 justify-center border rounded bg-gray-200 text-gray-700" type="text" name="username" value={this.state.username} onChange={this.handleChange} required/>
                                            </div>
                                            <label className="pt-3 text-sm">Password <span className="text-red-500">*</span></label>
                                            <div className="pb-4 pt-2">
                                                <input className="min-w-full md:w-96 px-3 py-1 justify-center border rounded bg-gray-200 text-gray-700" type="password" name="password" value={this.state.password} onChange={this.handleChange} required/>
                                            </div>
                                            <label className="pt-3 text-sm">E-mail <span className="text-red-500">*</span></label>
                                            <div className="pb-4 pt-2">
                                                <input className="min-w-full md:w-96 px-3 py-1 justify-center border rounded bg-gray-200 text-gray-700" type="email" name="email" value={this.state.email} onChange={this.handleChange} required/>
                                            </div>
                                            <label className="pt-3 text-sm">Phone number</label>
                                            <div className="pb-4 pt-2">
                                                <input className="min-w-full md:w-96 px-3 py-1 justify-center border rounded bg-gray-200 text-gray-700" type="tel" name="telNumber" value={this.state.telNumber} onChange={this.handleChange}/>
                                            </div>
                                        </div>
                                        <div className="md:ml-6 md:mt-10">
                                            <label className="pt-3 text-sm">Address</label>
                                            <div className="pb-4 pt-2">
                                                <textarea className="min-w-full md:w-96 px-3 py-2 bg-gray-200 text-gray-700 border rounded" type="text" name="address" rows="4" value={this.state.address} onChange={this.handleChange}></textarea>
                                            </div>
                                            <label className="pt-3 text-sm">City</label>
                                            <div className="pb-4 pt-2">
                                                <input className="min-w-full md:w-96 px-3 py-1 justify-center border rounded bg-gray-200 text-gray-700" type="text" name="registCity" value={this.state.registCity} onChange={this.handleChange}/>
                                            </div>
                                            <label className="pt-3 text-sm">Post code</label>
                                            <div className="pb-4 pt-2">
                                                <input className="min-w-full md:w-96 px-3 py-1 justify-center border rounded bg-gray-200 text-gray-700" type="text" name="postcode" value={this.state.postcode} onChange={this.handleChange}/>
                                            </div>
                                        </div>
                                    </div>
                                    
                        
                                    <div className="flex items-center justify-between py-4">
                                        <div className="flex items-center">
                                            <button className="text-sm text-center px-6 py-2 rounded-md border hover:bg-gray-100" type="submit">Register</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </section>
                </main>
    }
}

export default manageUser