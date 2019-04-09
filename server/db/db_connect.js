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

function connectdb(){
    return new Promise((resolve, reject) => {
        conn = init();
        conn.getConnection((err, connect)=> {
            if (err) return reject(err);
            return resolve(connect);
        });
    })
}

module.exports = connectdb;