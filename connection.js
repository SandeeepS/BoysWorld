const mongoose = require('mongoose');
async function connectMongoDb(url){
    return mongoose.connect(process.env.DB_CONNECT,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
        useCreateIndex:true

    }).then(()=>console.log("connected to mongodb"))
    .catch((err)=>console.log("MongoDB connection failed"));
}

module.exports = {
    connectMongoDb,
};