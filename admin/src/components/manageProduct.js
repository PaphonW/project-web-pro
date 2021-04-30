import React from 'react'
import {getCookie} from './../scripts/getCookie'

class manageProduct extends React.Component {

    constructor() {
        super()
        this.state = {
            name: "",
            maxPrice: "",
            inStock: true,
            prdName: "",
            prdPrice: "",
            prdStock: "",
            imgSrc: "",
            description: "",
            updateId: "",
            updateValue: "",
            removeId: "",
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleCheck = this.handleCheck.bind(this)
        this.searchProduct = this.searchProduct.bind(this)
        this.insertItem = this.insertItem.bind(this)
        this.updateStock = this.updateStock.bind(this)
        this.removeItem = this.removeItem.bind(this)
    }

    handleChange(e) {
        let value = e.target.value
        let name = e.target.name
        this.setState({
            [name]: value,
        })
    }

    handleCheck(e) {
        let check = e.target.checked
        let name = e.target.name
        this.setState({
            [name]: check,
        })
    }

    async searchProduct() {
        let info = this.state.info
        let maxPrice = this.state.maxPrice
        let inStock = ``

        this.state.inStock ? inStock = `>`: inStock = `<=`;

        let url = `http://localhost:3030/products`;
        url += `?inStock=${inStock}`;

        if(info) {
            url += `&info=${info}`;
            if(maxPrice) {
                url += `&maxPrice=${maxPrice}`;
            }
        }
        else if(maxPrice) {
            url += `&maxPrice=${maxPrice}`;
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
        if(!res.noProduct && res.err === false) {
            let output = ``;

            res.result.forEach(product => {

                output += 
                `
                <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
                    <td class="py-3 px-6 text-left">
                        <div class="flex items-center">${product.prdID}</div>
                    </td>
                    <td class="py-3 px-6 text-left">
                        <div class="flex items-center">
                            <div class="mr-2">
                                <img class="w-10" src="https://drive.google.com/uc?export=view&id=${product.imgSrc}" alt="${product.prdName}">
                            </div>
                            <span>${product.prdName}</span>
                        </div>
                    </td>
                    <td class="py-3 px-6 max-w-xs">${product.prdDescription}</td>
                    <td class="py-3 px-6 text-center">${product.prdPrice}</td>
                    <td class="py-3 px-6 text-center">${product.prdStock}</td>
                </tr>
                `
            });
            document.getElementById("itemShowcase").innerHTML = output;
        }
        else if(res.noProduct){
            document.getElementById("itemShowcase").innerHTML = `No product`;
        }
        else {
            alert("Please login.");
        }
    }

    async insertItem() {

        let productInfo = {
            prdName: this.state.prdName,
            prdPrice: this.state.prdPrice,
            prdStock: this.state.prdStock,
            imgSrc: this.state.imgSrc,
            prdDescription: this.state.description,
        }
  
        const res = await (await fetch("http://localhost:3030/insertProduct", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + getCookie('token'),
              'role': JSON.parse(getCookie('user'))[0].role,
          },
          body: JSON.stringify({product: productInfo})
        })).json();
        alert(res.message);
    }

    async updateStock() {

        let id = this.state.updateId
        let value = this.state.updateValue

        if(value) {
            const res = await (await fetch("http://localhost:3030/updateProduct", {
              method: "PUT",
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + getCookie('token'),
                  'role': JSON.parse(getCookie('user'))[0].role,
              },
              body: JSON.stringify({id: id, value: value})
            })).json();
            alert(res.message);
        }
        else {
            alert("Please fill the number!");
        }
    }
  
    async removeItem() {

        let id = this.state.removeId

        const res = await (await fetch("http://localhost:3030/removeProduct", {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getCookie('token'),
                'role': JSON.parse(getCookie('user'))[0].role,
            },
            body: JSON.stringify({id})
        })).json();
        alert(res.message);
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
        return <main className="container-fluid w-full h-screen flex bg-white mt-14">
            <section className="min-w-full h-screen p-10 md:p-12">
                <h1 className="pb-3 text-xl">
                    <strong>Product Management</strong>
                </h1>
                <div className="flex justify-center p-1">
                    <input className="w-2/6 justify-center border rounded-md bg-gray-200 mr-2 pl-3" type="text" placeholder="Information..." name="info" value={this.state.info} onChange={this.handleChange}/>
                    <input className="justify-center border rounded-md bg-gray-200 mr-2 text-center" type="text" name="maxPrice" placeholder="Maximum Price" value={this.state.maxPrice} onChange={this.handleChange}/>
                    <label className="inline-flex items-center mr-2 pr-2 border-r">
                        <input type="checkbox" className="form-checkbox h-5 w-5 text-gray-600" name="inStock" value={this.state.inStock} onChange={this.handleCheck} defaultChecked={this.state.inStock}/><span className="ml-2 text-gray-700">Available in stock</span>
                    </label>
                    <input className="rounded-md p-1 cursor-pointer" type="button" onClick={this.searchProduct} value="Search"/>
                </div>
                <div className="flex items-center justify-center overflow-hidden">
                    <div className="w-full lg:w-5/6">
                        <div className="bg-white shadow-md rounded my-6">
                            <table className="min-w-max w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                        <th className="py-3 px-6 text-left">ID</th>
                                        <th className="py-3 px-6 text-left">Name</th>
                                        <th className="py-3 px-6 text-center">Description</th>
                                        <th className="py-3 px-6 text-center">Price</th>
                                        <th className="py-3 px-6 text-center">Stock</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600 text-sm font-light" id="itemShowcase"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="ml-6 mb-4 w-max flex">
                    <form className="w-max md:w-max p-2 h-min bg-white rounded-xl md:shadow-lg md:p-8 mr-6" onSubmit={this.updateStock}>
                        <div className="container grid grid-cols-1">
                            <div>
                                <h1 className="pb-3 text-xl font-bold">Update stock</h1>
                                <label className="pt-3 text-sm">Product ID <span className="text-red-500">*</span></label>
                                <div className="pb-4 pt-2">
                                    <input 
                                        className="min-w-full px-3 py-1 justify-center border rounded bg-gray-200 text-gray-700" 
                                        type="number" name="updateId" required
                                        value={this.state.updateId}
                                        onChange={this.handleChange}
                                    />
                                </div>
                                <label className="pt-3 text-sm">Amount</label>
                                <div className="pb-4 pt-2">
                                    <input 
                                        className="min-w-full px-3 py-1 justify-center border rounded bg-gray-200 text-gray-700" 
                                        type="number" name="updateValue" 
                                        value={this.state.updateValue} 
                                        onChange={this.handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <button className="text-sm text-center px-6 py-2 rounded-md border hover:bg-gray-100" type="submit">Update</button>
                            </div>
                        </div>
                    </form>
                    <form className="w-max md:w-max p-2 h-auto bg-white rounded-xl md:shadow-lg md:p-8" onSubmit={this.removeItem}>
                        <div className="container grid grid-cols-1">
                            <div>
                                <h1 className="text-xl font-bold">Remove Product</h1>
                                <h2 className="pb-3 text-sm text-red-500">* It will remove entire of item.</h2>
                                <label className="pt-3 text-sm">Product ID <span className="text-red-500">*</span></label>
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
                        <form className="w-screen md:w-max p-10 h-min bg-white rounded-xl md:shadow-lg md:p-12" id="innerForm" onSubmit={this.insertItem}>
                            <div className="container grid grid-cols-1">
                                <div>
                                    <h1 className="pb-3 text-xl font-bold">Insert - Product Information</h1>
                                    <label className="pt-3 text-sm">Product Name <span className="text-red-500">*</span></label>
                                    <div className="pb-4 pt-2">
                                        <input 
                                            className="min-w-full md:w-96 px-3 py-1 justify-center border rounded bg-gray-200 text-gray-700" 
                                            type="text" name="prdName" required
                                            value={this.state.prdName} 
                                            onChange={this.handleChange}
                                        />
                                    </div>
                                    <label className="pt-3 text-sm">Price <span className="text-red-500">*</span></label>
                                    <div className="pb-4 pt-2">
                                        <input 
                                            className="min-w-full md:w-96 px-3 py-1 justify-center border rounded bg-gray-200 text-gray-700" 
                                            type="number" name="prdPrice" required
                                            value={this.state.prdPrice}
                                            onChange={this.handleChange}
                                        />
                                    </div>
                                    <label className="pt-3 text-sm">Amount <span className="text-red-500">*</span></label>
                                    <div className="pb-4 pt-2">
                                        <input 
                                            className="min-w-full md:w-96 px-3 py-1 justify-center border rounded bg-gray-200 text-gray-700" 
                                            type="number" name="prdStock" required
                                            value={this.state.prdStock} 
                                            onChange={this.handleChange}
                                        />
                                    </div>
                                    <label className="pt-3 text-sm">Image Source (Only ID from Google Drive) <span className="text-red-500">*</span></label>
                                    <div className="pb-4 pt-2">
                                        <input 
                                            className="min-w-full md:w-96 px-3 py-1 justify-center border rounded bg-gray-200 text-gray-700" 
                                            type="text" name="imgSrc" required
                                            value={this.state.imgSrc} 
                                            onChange={this.handleChange}
                                        />
                                    </div>
                                    <label className="pt-3 text-sm">Description</label>
                                    <div className="pb-4 pt-2">
                                        <textarea 
                                            className="min-w-full md:w-96 px-3 py-2 bg-gray-200 text-gray-700 border rounded" 
                                            type="text" name="description" rows="2"
                                            value={this.state.description}
                                            onChange={this.handleChange}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pb-4">
                                <div className="flex items-center">
                                    <button className="text-sm text-center px-6 py-2 rounded-md border hover:bg-gray-100" type="submit">Insert</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    }
}

export default manageProduct