const express = require('express');
const app = express();
const routes = require('./routes/userRoute');

app.set('view engine','ejs');
app.use(express.static("views"));
app.use(express.static(__dirname));



app.use('/',routes);




app.listen(5000,()=>{
    console.log('server is running at :',5000);
});