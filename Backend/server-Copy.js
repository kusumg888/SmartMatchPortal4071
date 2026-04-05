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

// ---------------- REGISTER API ----------------
app.post("/register", (req, res) => {

    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
        return res.send("All fields are required");
    }

    const sql = `
    INSERT INTO users (full_name, email, phone, password)
    VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [name, email, phone, password], (err, result) => {

        if (err) {
            console.log(err);
            return res.send("Error in registration");
        }

        res.send("Registration successful");

    });

});

// ---------------- LOGIN API ----------------


app.post("/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.send("All fields are required");
    }

    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

    db.query(sql, [email, password], (err, result) => {

        if (err) {
            console.log(err);
            return res.send("Server error");
        }

        if (result.length > 0) {
            res.send("Login successful");
        } else {
            res.send("Invalid email or password");
        }

    });

});

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
    SELECT lost_item.*, users.full_name, users.email, users.phone
    FROM lost_item
    JOIN users ON lost_item.user_id = users.id
    ORDER BY lost_item.id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log("DB ERROR:", err);  // 👈 IMPORTANT
            return res.status(500).json({ error: "DB error" });
        }

        res.json(result);

    });

});


// ---------------- GET FOUND ITEMS ----------------
app.get("/found-items", (req, res) => {

    const sql = `
    SELECT found_item.*, users.full_name, users.email, users.phone
    FROM found_item
    JOIN users ON found_item.user_id = users.id
    ORDER BY found_item.id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log("DB ERROR:", err);
            return res.status(500).json({ error: "DB error" });
        }

        res.json(result);

    });

});


// ---------------- GET SINGLE LOST ITEM ----------------
app.get("/lost-items/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
    SELECT lost_item.*, users.full_name, users.email, users.phone
    FROM lost_item
    JOIN users ON lost_item.user_id = users.id
    WHERE lost_item.id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error fetching item" });
        }

        res.json(result[0]); // ✅ single object
    });

});

// ---------------- GET SINGLE FOUND ITEM ----------------
app.get("/found-items/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
    SELECT found_item.*, users.full_name, users.email, users.phone
    FROM found_item
    JOIN users ON found_item.user_id = users.id
    WHERE found_item.id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error fetching item" });
        }

        res.json(result[0]); // ✅ single object
    });

});


// ---------------- START SERVER ----------------
app.listen(5000, () => {
    console.log("Server running on port 5000");
});

// app.put("/mark-resolved/:id", (req, res) => {

//     const id = req.params.id;

//     const sql = "UPDATE lost_item SET status = 'Resolved' WHERE id = ?";

//     db.query(sql, [id], (err, result) => {
//         if (err) {
//             console.log(err);
//             return res.send("Error updating status");
//         }

//         res.send("Item marked as resolved");
//     });
// });
app.put("/mark-resolved/:id", (req, res) => {

    const id = req.params.id;

    // 🔍 Step 1: Check current status
    const checkSql = "SELECT status FROM lost_item WHERE id = ?";

    db.query(checkSql, [id], (err, result) => {

        if (err) {
            console.log(err);
            return res.send("Error checking status");
        }

        if (result.length === 0) {
            return res.send("Item not found");
        }

        // ⚠️ If already resolved
        if (result[0].status === "Resolved") {
            return res.send("Item already resolved");
        }

        // ✅ Step 2: Update status
        const updateSql = "UPDATE lost_item SET status = 'Resolved' WHERE id = ?";

        db.query(updateSql, [id], (err2) => {

            if (err2) {
                console.log(err2);
                return res.send("Error updating status");
            }

            // ✅ SUCCESS MESSAGE
            res.send("Item marked as resolved successfully 🎉");
        });

    });
});