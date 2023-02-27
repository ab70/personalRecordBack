const express = require('express');
const path = require('path')
const cors = require('cors');
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path:'backend/.env'})
const cookieParser = require('cookie-parser')
const MongoDbStore = require('connect-mongo')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('express-flash') //must active when using connect-mongo

/* Creating an instance of express. */
const app = express();

const PORT = process.env.PORT || 3000;

/* Setting the strictQuery to true. */
mongoose.set('strictQuery',true);

/* Connecting to the mongodb database. */
const connection = mongoose.connect(process.env.Mongoose_connect,{useNewUrlParser: true, useUnifiedTopology: true}).then((response)=>{
    console.log('MongoDb connected');
    
});

app.listen(PORT,()=>{
    console.log(`Listening to PORT ${PORT}`);
});
app.use(session({
    secret: process.env.SECRET_KEY,
    resave:false,
    store: MongoDbStore.create({
        mongoUrl: process.env.Mongoose_connect
    }),
    saveUninitialized: false,
    cookie:{maxAge: 5000}
}))
app.use(flash())


//used to handle cross-site requests
app.use(cors({
    credentials:true,
    origin: true,
    //exposedHeaders:['set-cookie'],
}));


/* This is a middleware that is used to handle cross-site requests. tackle header issue */
app.use(function(req,res,next){
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', true);
    // res.header("Access-Control-Allow-Origin", "http://192.168.0.107:3000");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // res.header('Access-Control-Allow-Credentials', true);
    next();
})

//session middleware goes here
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

//to make available session data to frontend(combine to response)
// app.use((req,res,next)=>{
//     req.locals.session = req.session
//     next();
// });

//static file location declared here
app.use(express.static(path.join(__dirname, 'public')));


//required api.js and passed the app to there
require('./routes/api')(app);



