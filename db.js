const mysql=require('mysql2');
const db=mysql.createConnection({
    host: 'localhost',
    user:'',//your db username
    password:'',//your db pass
    database:'workers_tracker'
});
db.connect((err)=>{
    if(err)
        console.log("Database connection failed")
    else
        console.log("Connection successful")
});

module.exports=db;
