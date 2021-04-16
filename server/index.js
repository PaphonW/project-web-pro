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

router.get("/login", authorize, (req, res) => {
    res.json({auth: true});
});

router.get("/logout", (req, res) => {
    res.json({auth: false, token: "", result: ""});
});

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
                // get token with JWT
                const token = jwt.sign({id}, process.env.SECRET, {
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

// Change account's role
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

// For showing in index page
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