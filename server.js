const env = require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const session = require('express-session');
const routes = require('./routes/userRoute');
const {connectMongoDb} = require('./connection');


app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));
app.set('view engine','ejs');
app.use(express.static("views"));
app.use(express.static(__dirname));


//session
const oneDay = 1000 * 60 * 60 * 24;
//configuring express session
app.use(session({
    secret: 'your_secret_key', // Change this to a strong, random key for session encryption
    resave: false,
    saveUninitialized: true,
    cookie:{maxAge:oneDay}
  }));
  

//mongoDb connection
 mongoose.connect(process.env.DB_CONNECT,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
   

}).then(()=>console.log("connected to mongodb"))
.catch((err)=>console.log("MongoDB connection failed",err));

app.use('/',routes);

const port  = process.env.PORT || 5001
app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
});


// app.listen(5000,()=>{
//     console.log('server is running at :',5000);
// });