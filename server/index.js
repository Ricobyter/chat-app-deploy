const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const userRoutes = require("./routes/userRoutes")
const messageRoutes = require("./routes/messagesRoute")
const socket = require("socket.io");
const app = express();
const path = require("path")
require("dotenv").config()




app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoutes);

//----Deployment---
if(process.env.NODE_ENV === "production"){
    const dirPath = path.resolve()

    app.use(express.static("./public/build"));
    app.get("*", (req,res) => {
        res.sendFile(path.resolve(dirPath, "./public/build", "index.html"));
    })

}



mongoose.connect(process.env.MONGO_URL,{
    // useNewUrlParser : true,
    // useUnifiedTopology: true,
}).then(()=>{
    console.log('MongoDB Connected')
}).catch((err) =>{
    console.log(err.message)
});

const server = app.listen(process.env.PORT, () =>{
    console.log(`Server started on Port ${process.env.PORT}`)
})

const io = socket(server, {
    cors: {
        origin : "https://chat-app-deploy-cpdy.onrender.com",
        credentials: true,
    }
});

global.onlineUsers = new Map()

io.on("connection", (socket) => {
    global.chatSocket = socket;
socket.on("add-user",(userId) => {
    onlineUsers.set(userId, socket.id);
});

socket.on("send-msg" , (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if(sendUserSocket){  
     socket.to(sendUserSocket).emit("msg-receive", data.message);
     }
})
})