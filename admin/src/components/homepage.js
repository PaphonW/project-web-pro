import React from 'react'
import {Link} from 'react-router-dom';
import background from './../img/dashboardBG.jpg'

class HomePage extends React.Component {
    constructor() {
        super();
        this.state = {
            currentDateTime: Date().toLocaleString(),
        }
    }
    render () {
        return <main className="w-screen bg-center bg-no-repeat bg-cover" style={{ backgroundImage: `url(${background})`}}>
                    <div className="container-fluid w-full h-screen flex items-center justify-center bg-black bg-opacity-20">
                        <section className="h-min bg-white p-10 rounded md:shadow-lg md:p-12">
                            <h1 className="pb-3 text-xl">
                                <strong>Dashboard</strong>
                            </h1>
                            <span id="date">Date: {this.state.currentDateTime}</span>
                            <div className="pt-3">
                            <Link to="/manageProduct" className="leading-none border rounded text-black border-white hover:border-transparent hover:text-teal mt-4 lg:mt-0 lg:hover:bg-gray-200 lg:border-gray-300 lg:py-2 lg:px-4">Manage Products</Link>
                            <span className="pl-1"><Link to="/manageUser" className="leading-none border rounded text-black border-white hover:border-transparent hover:text-teal mt-4 lg:mt-0 lg:hover:bg-gray-200 lg:border-gray-300 lg:py-2 lg:px-4">Manage Users</Link></span>
                            </div>
                        </section>
                    </div>
                    
                </main>
    }
}

export default HomePage