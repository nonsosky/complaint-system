let connString = {};

if (process.env.NODE_ENV === "production"){
    connString.host = "";
    connString.user = "";
    connString.password = "";  
    connString.database = "";  
}

else {
    connString.host = "localhost";
    connString.user = "root";
    connString.password = ""; 
    connString.database = "complaint-system";
}

module.exports = connString;
