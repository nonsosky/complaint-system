let connString = {};

if (process.env.NODE_ENV === "production"){
    connString.host = "us-cdbr-iron-east-03.cleardb.net";
    connString.user = "b066a03eea6c2b";
    connString.password = "25e790cb";  
    connString.database = "heroku_c97954ee1bcdfbd";  
}

else {
    connString.host = "localhost";
    connString.user = "root";
    connString.password = ""; 
    connString.database = "complaint-system";
}

module.exports = connString;
