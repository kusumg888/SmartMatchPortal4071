const express = require("express");
const cors = require("cors");
const multer = require("multer");
const db = require("./db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make uploads folder public
app.use("/uploads", express.static("uploads"));


// ---------------- IMAGE UPLOAD SETUP ----------------
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });


// ---------------- TEST ROUTE ----------------
app.get("/", (req, res) => {
    res.send("Server is running");
});


// ---------------- LOST ITEM API ----------------
app.post("/lost-item", upload.single("image"), (req, res) => {

    const { itemname, category, description, location, lostdate } = req.body;

    const image = req.file ? req.file.filename : null;

    const userId = 1; // ⚠️ TEMP (replace with logged-in user later)

    const sql = `
    INSERT INTO lost_item 
    (itemname, category, description, location, lostdate, image, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [itemname, category, description, location, lostdate, image, userId], (err, result) => {

        if (err) {
            console.log(err);
            return res.send("Error saving lost item");
        }

        res.send("Lost item reported successfully");

    });

});


// ---------------- FOUND ITEM API ----------------
app.post("/found-item", upload.single("image"), (req, res) => {

    const { itemname, category, description, location, founddate } = req.body;

    const image = req.file ? req.file.filename : null;

    const userId = 1; // ⚠️ TEMP

    const sql = `
    INSERT INTO found_item
    (itemname, category, description, location, founddate, image, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [itemname, category, description, location, founddate, image, userId], (err, result) => {

        if (err) {
            console.log(err);
            return res.send("Error saving found item");
        }

        res.send("Found item reported successfully");

    });

});


// ---------------- GET LOST ITEMS ----------------
app.get("/lost-items", (req, res) => {

    const sql = `
    SELECT lost_item.*, users.full_name, users.email
    FROM lost_item
    JOIN users ON lost_item.user_id = users.id
    ORDER BY lost_item.created_at DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.send("Error fetching lost items");
        }

        res.json(result);

    });

});


// ---------------- GET FOUND ITEMS ----------------
app.get("/found-items", (req, res) => {

    const sql = `
    SELECT found_item.*, users.full_name, users.email
    FROM found_item
    JOIN users ON found_item.user_id = users.id
    ORDER BY found_item.created_at DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.send("Error fetching found items");
        }

        res.json(result);

    });

});


// ---------------- GET SINGLE LOST ITEM ----------------
app.get("/lost-items/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
    SELECT lost_item.*, users.full_name, users.email
    FROM lost_item
    JOIN users ON lost_item.user_id = users.id
    WHERE lost_item.id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);
            return res.send("Error fetching item");
        }

        res.json(result[0]);

    });

});


// ---------------- GET SINGLE FOUND ITEM ----------------
app.get("/found-items/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
    SELECT found_item.*, users.full_name, users.email
    FROM found_item
    JOIN users ON found_item.user_id = users.id
    WHERE found_item.id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);
            return res.send("Error fetching item");
        }

        res.json(result[0]);

    });

});


// ---------------- START SERVER ----------------
app.listen(5000, () => {
    console.log("Server running on port 5000");
});