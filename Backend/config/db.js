const mongoose = require('mongoose')

const connectDB =async () => {
    try{
        await mongoose.connect('mongodb+srv://maitri:1110@cluster0.1xi9ozw.mongodb.net/ticket_booking');
        console.log("MongoDB Connected...!");
    }catch(err){
        console.log("MongoDB COnnection Fail..!",err);
    }
};

module.exports = connectDB;