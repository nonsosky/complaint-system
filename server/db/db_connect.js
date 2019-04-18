const mysql = require("mysql");
const {host,user,password,database} = require("./db_config");

function init() {
    return mysql.createPool({
        host,
        user,
        password,
        database,
        connectionLimit: 10
    });
}
let conn = init();

function connectdb(){
    return new Promise((resolve, reject) => {
        conn.getConnection((err, connect)=> {
            if (err) return reject(err);
            connect.query("SET time_zone='+01:00';", (error=>{
                if (error) console.log(error);
            }))
            return resolve(connect);
        });
    })
}

module.exports = connectdb;