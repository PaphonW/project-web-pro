import React from 'react'

class LoginPage extends React.Component {

    constructor() {
        super()
        this.state = {
            username: "",
            password: "",
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(e) {
        let value = e.target.value
        let name = e.target.name
        this.setState({
            [name]: value,
        })
    }

    async handleSubmit(e) {
        e.preventDefault()
        // Sign in
        let info = {
            username: this.state.username,
            password: this.state.password
        }

        const res = await (await fetch("http://localhost:3030/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(info)
        })).json()

        // Call public API for show country where user logged in.
        const ipRes = await (await fetch("https://api.ipgeolocation.io/ipgeo?apiKey=13eb6deade844b72b1447140ccdaa947")).json()

        if(!res.err) {
            if(res.result[0].role === 'admin') {
                document.cookie = `auth=${res.auth}`
                document.cookie = `token=${res.token}`
                document.cookie = `user=${JSON.stringify(res.result)}`
                document.cookie = `country=${ipRes.country_name}`;
                window.location.href = `/`
            }
            else {
                alert("You are not admin! Please login with admin account.")
                window.location.reload()
            }
        }
        else {
            alert(res.message)
        }
    }

    render() {
        return <main className="container-fluid w-screen h-screen flex items-center justify-center">

                    <form className="w-min h-min bg-white rounded-xl md:shadow-lg md:p-12" onSubmit={this.handleSubmit}>
                        <div>
                            <h1 className="text-center pb-3 text-xl">
                                Sign in to <strong>Wong IT</strong> (Admin)
                            </h1>
                            <p className="pt-3 font-bold">Username</p>
                            <div className="pb-4 pt-2">
                                <input type="text" name="username" className="min-w-full md:w-96 px-3 py-1 justify-center border rounded bg-gray-200 text-gray-700" value={this.state.username} onChange={this.handleChange} required/>
                            </div>
                            <p className="pt-3 font-bold">Password</p>
                            <div className="pb-4 pt-2">
                                <input type="password" name="password" className="min-w-full md:w-96 px-3 py-1 justify-center border rounded bg-gray-200 text-gray-700" value={this.state.password} onChange={this.handleChange} required/>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center">
                                <button type="submit" className="w-max text-sm text-center px-6 py-2 rounded-md border hover:bg-gray-100">Sign in</button>
                            </div>
                        </div>
                    </form>
                
                </main>
    }   
}

export default LoginPage