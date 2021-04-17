const express = require("express");
const app = express();
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bp = require("body-parser");
const dotenv = require("dotenv").config();
const cors = require("cors");
app.use(cors({
    credentials: true,
}));

app.use(bp.urlencoded({ extended: true }));

const router = express.Router();
app.use("/", router);
router.use(bp.json());

var dbConnect = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

dbConnect.connect(function(err) {
    if(err) throw err;

console.log(`Connect DB: ${process.env.DB_NAME}`);
});

// ***** authorization middleware *****
const authorize = (req, res, next) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        // console.log(token);
        let decoded = jwt.verify(token, process.env.SECRET);
        // console.log(decoded);
        next();
    }
    catch (err) {
        res.json({err: true, message: "Authentication failed!"});
    }
};

const adminAuthorize = (req, res, next) => {
    // **Note: Change in next phase
    // Change role from Database
    // This method is not secure to verify admin.
    if(req.headers.role === 'admin') {
        // console.log("Admin accessed.")
        try {
            const token = req.headers['authorization'].split(' ')[1];
            let decoded = jwt.verify(token, process.env.SECRET);
            next();
        }
        catch (err) {
            res.json({err: true, message: "Authentication failed!"});
        }
    }
    else {
        res.json({err: true, message: "You don't have the permission."});
    }
    
};
// ***** *****

// This function can use with user role and admin role.

// Testing resgiter (1)
// method: POST
// URL: http://localhost:3030/register
// body: raw JSON
// {
//     "username": "palm11695",
//     "password": "natanonrit",
//     "email": "natanon.rit@student.mahidol.edu",
//     "phone": "0901231234",
//     "address": "888 Skypark Condo",
//     "city": "Nakhon Pathom",
//     "postcode": "70130"
// }

// Testing register (2)
// method: POST
// URL: http://localhost:3030/register
// body: raw JSON
// {
//     "username": "Hikari",
//     "password": "Wlight",
//     "email": "paphon@wongit.com",
//     "phone": "0834285501",
//     "address": "532/4",
//     "city": "Bangkok",
//     "postcode": "10130"
// }

router.post("/register", (req, res) => {
    // console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;

    const user = {
        email: req.body.email,
        phone: req.body.tel,
        address: req.body.address,
        city: req.body.city,
        postcode: req.body.postcode
    }

    // Set if null
    if(req.body.email === '') user.email = '-';
    if(req.body.tel === '') user.phone = '-';
    if(req.body.address === '') user.address = '-';
    if(req.body.city === '') user.city = '-';
    if(req.body.postcode === '') user.postcode = '-1';

    dbConnect.query(
        "SELECT username FROM login_info WHERE username = ?", [username],
        (err, result) => {
            if(err) res.send({err: err, route: "register.html"});
            if(!result.length > 0) {
                dbConnect.query(
                    "INSERT INTO login_info (username, password) VALUE (?,?)", [username, password],
                    (err, result) => {
                        if(err) res.send({err: err, route: "register.html"});
                        if(result.affectedRows === 1) {
                            dbConnect.query(
                                "INSERT INTO user_info SET ?", [user], 
                                (err, result) => {
                                    if(err) res.send({err: err, route: "register.html"});
                                    res.send({registered: true, message: "Registeration successful!", route: "login.html"}); //send route to change page
                                }
                            );
                        }
                    }
                );   
            }
            else {
                res.send({registered: false, message: "This username is already used.", route: "register.html"});
            }
        }
    );

});

// Check that token is not expired.
// method: GET
// URL: http://localhost:3030/login
// headers: {
//      'authorization': 'Bearer <token>',
// }

router.get("/login", authorize, (req, res) => {
    res.json({auth: true});
});


// Logout
// method: GET
// URL: http://localhost:3030/logout
// Don't need to send any value.

router.get("/logout", (req, res) => {
    res.json({auth: false, token: "", result: ""});
});

// Login **(You have to get token from this service to check the other services that need to authorize.)**
// Testing login (1)
// method: POST
// URL: http://localhost:3030/login
// body: raw JSON
// {
//     "username": "admin",
//     "password": "admin"
// }

// Testing login (2)
// method: POST
// URL: http://localhost:3030/login
// body: raw JSON
// {
//     "username": "Lelouch",
//     "password": "345678912"
// }

router.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    dbConnect.query(
        "SELECT id, username, role FROM login_info WHERE username = ? AND password = ?", [username, password],
        (err, result) => {
            if(err) res.send({err: err});
            // Check if username and password are correspond in database
            if(result.length > 0) {
                const id = result[0].id;
                const username = result[0].username;
                const role = result[0].role;
                // get token with JWT
                const token = jwt.sign({id: id, username: username, role: role}, process.env.SECRET, {
                    expiresIn: "1h",
                });
                res.json({err:false, auth: true, token: token, result: result});
            }
            else {
                res.send({err: true, message: "Incorrect username or password!!"});
            }
        }    
    );
});

// Retrieve user for admin
// Testing getUser (1)
// method: GET
// URL: http://localhost:3030/getUser
// headers: {
//      'authorization': 'Bearer <token>',
//      'role': 'admin'
// }

// Testing getUser (2)
// method: GET
// URL: http://localhost:3030/getUser?info=Wat
// headers: {
//      'authorization': 'Bearer <token>',
//      'role': 'admin'
// }

router.get("/getUser", adminAuthorize, (req, res) => {

    let info = req.query.info;
    let city = req.query.city;
    
    // Write a MySQL query with each citeria that got from search query
    let sqlQuery = `SELECT login_info.username, login_info.role, user_info.* FROM user_info INNER JOIN login_info WHERE login_info.id = user_info.id`;
    if(info || city) sqlQuery += ` AND`;
    if(info) {
        sqlQuery += ` login_info.username LIKE '%${info}%'`;
        if(city) {
            sqlQuery += ` AND user_info.city LIKE '%${city}%'`;
        }
    }
    else if(city) {
        sqlQuery += ` user_info.city LIKE '%${city}%'`;
    }

    dbConnect.query(
        sqlQuery,
        (err, result) => {
            if(err) res.send({err: err});

            if(result.length > 0) {
                res.send({err: false, result: result});
            }
            else {
                res.send({err: false, noUser: true});
            }
        }
    );
});

// Change account's role (It will change to the opposite role(value).)
// Testing login (1)
// method: PUT
// URL: http://localhost:3030/changeRole
// headers: {
//      'authorization': 'Bearer <token>',
//      'role': 'admin'
// }
// body: raw JSON
// {
//     "id": "1",
//     "value": "user"
// }

// Testing login (2)
// method: PUT
// URL: http://localhost:3030/changeRole
// headers: {
//      'authorization': 'Bearer <token>',
//      'role': 'admin'
// }
// body: raw JSON
// {
//     "id": "2",
//     "value": "user"
// }

router.put("/changeRole", adminAuthorize, (req, res) => {
    let newRole;
    req.body.value==='admin' ? newRole='user':newRole='admin';
    if(req.body.value && req.body.id) {
        dbConnect.query(
            "UPDATE login_info SET role = ? WHERE id = ?", [newRole, req.body.id],
            (err, result) => {
                if(err) res.send({err: err});
                res.send({message: `User ID: ${req.body.id} is successfully updated.`})
            }
        );
    }
    else {
        res.send({message: "Invalid"});
    }
});

// Remove User by admin
// Testing remove user (1)
// method: DELETE
// URL: http://localhost:3030/removeUser
// headers: {
//      'authorization': 'Bearer <token>',
//      'role': 'admin'
// }
// body: raw JSON
// {
//      "id": "1"
// }

// Testing remove user (2)
// method: DELETE
// URL: http://localhost:3030/removeUser
// headers: {
//      'authorization': 'Bearer <token>',
//      'role': 'admin'
// }
// body: raw JSON
// {
//      "id": "2"
// }
router.delete("/removeUser", adminAuthorize, (req, res) => {
    if(req.body.id) {
        dbConnect.query(
            "DELETE FROM user_info WHERE id = ?", [req.body.id],
            (err, result) => {
                if(err) res.send({err: err});
                if(result.affectedRows === 1) {
                    dbConnect.query(
                        "DELETE FROM login_info WHERE id = ?", [req.body.id],
                        (err, result) => {
                            if(err) res.send({err: err});
                            res.send({message: "Successfully removed"});
                        }
                    )
                }
            }
        );
    }
    else {
        res.send({message: "Invalid"});
    }
});

// For showing in index page ** It will send 8 products for the most.
// Retrieve user for admin
// Testing get product(s) (1)
// method: GET
// URL: http://localhost:3030/recommend
// Just use to show the recommend items on index page.
router.get("/recommend", (req, res) => {
    dbConnect.query(
        "SELECT * FROM product ORDER BY prdID ASC LIMIT 8",
        (err, result) => {
            if(err) res.send({err: err});

            if(result.length > 0) {
                res.send(result);
            }
            else {
                res.send({err: false, noProduct: true});
            }
        }
    );
});

// Searching all products in database
// Retrieve user for admin
// Testing get product(s) (1)
// method: GET
// URL: http://localhost:3030/products?info=RTX
// headers: {
//      'authorization': 'Bearer <token>',
// }

// Testing get product(s) (2)
// method: GET
// URL: http://localhost:3030/products?info=RTX&maxPrice=2000
// headers: {
//      'authorization': 'Bearer <token>',
// }

router.get("/products", authorize, (req, res) => {
    
    let info = req.query.info;
    let maxPrice = req.query.maxPrice;
    let inStock = req.query.inStock;
    
    // Write a MySQL query with each citeria that got from search query
    let sqlQuery = `SELECT * FROM product`;
    if(info || maxPrice || inStock) sqlQuery += ` WHERE`;
    if(info) {
        sqlQuery += ` (prdName LIKE '%${info}%' OR prdDescription LIKE '%${info}%')`;
        if(maxPrice) {
            sqlQuery += ` AND prdPrice <= ${maxPrice}`;
        }
        if(inStock) {
            sqlQuery += ` AND prdStock ${inStock} 0`;
        }
    }
    else if(maxPrice) {
        sqlQuery += ` prdPrice <= ${maxPrice}`;
        if(inStock) {
            sqlQuery += ` AND prdStock ${inStock} 0`;
        }
    }
    else if(inStock) {
        sqlQuery += ` prdStock ${inStock} 0`;
    }

    // console.log(sqlQuery);

    dbConnect.query(
        sqlQuery,
        (err, result) => {
            if(err) res.send({err: err});

            if(result.length > 0) {
                res.send({err: false, result: result});
            }
            else {
                res.send({err: false, noProduct: true});
            }
        }
    );
});

// Insert product by admin
// Testing insert product (1)
// method: POST
// URL: http://localhost:3030/insertProduct
// headers: {
//      'authorization': 'Bearer <token>',
//      'role': 'admin'
// }
// body: raw JSON
// {
//     "product": {
//         "prdName": "Razer Blade 15",
//         "prdPrice": "2099",
//         "prdStock": "2",
//         "imgSrc": "16vUOP350XRUXSX0J4u1bGNwFX1X09bxh",
//         "prdDescription": "Just when you thought a gaming laptop couldn’t be any more beastly—introducing the new Razer Blade 15, now available with NVIDIA® GeForce RTX™ 30 Series GPUs for the most powerful gaming laptop graphics ever. The Advanced Model now features the world’s first and fastest 15.6” laptop displays."
//     }
// }
// imgSrc is a image id from Google Drive.

// Testing insert product (2)
// method: POST
// URL: http://localhost:3030/insertProduct
// headers: {
//      'authorization': 'Bearer <token>',
//      'role': 'admin'
// }
// body: raw JSON
// {
//     "product": {
//         "prdName": "MSI GL75 Leopard",
//         "prdPrice": "1500",
//         "prdStock": "5",
//         "imgSrc": "1EoapqcUPoK3xHyO51bo9jOSVMK8rok9w",
//         "prdDescription": "Just when you thought a gaming laptop couldn’t be any more beastly—introducing the new Razer Blade 15, now available with NVIDIA® GeForce RTX™ 30 Series GPUs for the most powerful gaming laptop graphics ever. The Advanced Model now features the world’s first and fastest 15.6” laptop displays."
//     }
// }
// imgSrc is a image id from Google Drive.

router.post("/insertProduct", adminAuthorize, (req, res) => {
    if(req.body.product) {
        dbConnect.query(
            "INSERT INTO product SET ?", req.body.product,
            (err, result) => {
                if(err) res.send({err: err});
                res.send({message: "Product is added."});
            }
        );
    }
    else {
        res.send({message: "Invalid"});
    }
});

// Update product stock by admin
// Testing update product (1)
// method: PUT
// URL: http://localhost:3030/updateProduct
// headers: {
//      'authorization': 'Bearer <token>',
//      'role': 'admin'
// }
// body: raw JSON
// {
//     "id": "1",
//     "value": "5"
// }

// Testing update product (2)
// method: PUT
// URL: http://localhost:3030/updateProduct
// headers: {
//      'authorization': 'Bearer <token>',
//      'role': 'admin'
// }
// body: raw JSON
// {
//     "id": "3",
//     "value": "8"
// }

router.put("/updateProduct", adminAuthorize, (req, res) => {
    if(req.body.value && req.body.id) {
        dbConnect.query(
            "UPDATE product SET prdStock = ? WHERE prdID = ?", [req.body.value, req.body.id],
            (err, result) => {
                if(err) res.send({err: err});
                res.send({message: `Product ID: ${req.body.id} is successfully updated.`})
            }
        )
    }
    else {
        res.send({message: "Invalid"});
    }
    
});

// Delete product by admin
// Testing remove product (1)
// method: PUT
// URL: http://localhost:3030/removeProduct
// headers: {
//      'authorization': 'Bearer <token>',
//      'role': 'admin'
// }
// body: raw JSON
// {
//     "id": "1",
// }

// Testing remove product (2)
// method: PUT
// URL: http://localhost:3030/removeProduct
// headers: {
//      'authorization': 'Bearer <token>',
//      'role': 'admin'
// }
// body: raw JSON
// {
//     "id": "8",
// }
router.delete("/removeProduct", adminAuthorize, (req, res) => {
    if(req.body.id) {
        dbConnect.query(
            "DELETE FROM product WHERE prdID = ?", [req.body.id],
            (err, result) => {
                if(err) res.send({err: err});
                res.send({message: "Successfully removed"});
            }
        );
    }
    else {
        res.send({message: "Invalid"});
    }
});


app.listen(3030, function() {
    console.log(`Server listening at Port 3030`);
});