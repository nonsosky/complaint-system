const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const bodyParser = require("body-parser");

//load local files
const connect = require("./server/db/db_connect");

//Load department repos
const departmentRepository = require("./server/repository/DepartmentRepos");

//load routes
const student = require('./routes/student');
const mycomplaints = require('./routes/mycomplaint');

connect().then(conn =>{
console.log("connected to db")
},err=>{
    console.log(err)
})

//express application
const app = express();

//setup public directory
app.use(express.static(__dirname+'/public/'));

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

//session middlewware
app.use(session({resave: true, saveUninitialized: true, secret: "nonsosky"}));

//passport middleware
app.use(passport.initialize())
app.use(passport.session());

//flash middleware
app.use(flash());

//server listening on port 5000
const port = process.env.PORT || 5000;

//setting up application middleware
//express-handlebars middleware
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

//local variables
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
});

//homepage route
app.get('/',(req, res) => {
    console.log(req.user)
    departmentRepository.findMany([])
     .then(departments => {
         console.log(departments);
         res.render('index', {
            pageTitle: 'Student Complaint System',
            departments
        });
     },err=>{
         console.log(err);
     });
});

//Logout route
app.get('/logout', (req, res) =>{
    req.session.destroy((err)=>{
        console.log("Loged out successfully");
    });
    req.logout();
    res.redirect('/')
})

//Use routes
app.use('/student', student);
app.use('/mycomplaints', mycomplaints);

app.listen(port, () => {
    console.log(`server up on port ${port}`);
});