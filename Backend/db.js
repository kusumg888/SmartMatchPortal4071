const mysql= require("mysql2");

const db = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password : "Kusum8",
        database : "smartmatch_lost_found_portal"
    }
);

db.connect((err)=> 
{
    if(err)
    {
        console.log("Database connection is failed : ");
    }
    else
    {
        console.log("Connected to Mysql");
    }
});

module.exports = db ;
