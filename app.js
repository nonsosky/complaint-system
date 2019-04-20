const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const bodyParser = require("body-parser");
const http = require('http');


//load local files
const connect = require("./server/db/db_connect");
const {formatChat} = require('./server/helpers/formatter');

//load routes
const student = require('./routes/student');
const admin = require('./routes/admin');
const aboutus = require('./routes/aboutus');

//-- Repositories
const postRepository = require('./server/repository/PostRepos');


//admin init
const {adminConfig} = require('./server/config/init');

connect().then(conn =>{
console.log("connected to db")
adminConfig()
},err=>{
    console.log(err)
})

//express application
const app = express();


const server = http.createServer(app);
const io = require('socket.io')(server);
io.on("connection", (socket)=>{
    socket.on("chat", (complaint)=>{
        socket.join(complaint.id);

        socket.on("newMessage", (message)=>{
            //submit to db
            postRepository.insert(message)
                .then(post => {
                    //-- retrieve
                    postRepository.findJoin({ student: [{ column: 'lastName' }, { column: 'firstName' }], post: [{ column: 'createdAt' }, { column: 'reply' }, { column: 'complaint_id' }, { column: 'student_id' }, { column: 'user_type' }] }, { student: 'student_id' }, [{ table: 'post', column: 'student_id', value: post.student_id, operator: '=', nextOperator: 'AND' }, { table: 'post', column: 'complaint_id', value: post.complaint_id, operator: '=', nextOperator: 'AND'}, { table: 'post', column: 'id', value: post.id, operator: '=' }])
                        .then(chat => {

                            if (chat) {
                                chat = formatChat(chat);
                            }
                            io.to(complaint.id).emit('message', chat[0]);
                        })
                        .catch(err => {
                            console.log(err);
                        });
                
              })
              .catch(err=>{
                  console.log(err);
              });
        });
    })
});

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
    res.render('index', {
        pageTitle: 'Student Complaint System',
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
app.use('/admin/', admin);
app.use('/aboutus/', aboutus);


server.listen(port, () => {
    console.log(`server up on port ${port}`);
});