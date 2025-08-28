const express = require("express");
require("dotenv").config();
const chatRouter = require("./routes/chatRoute");
const cors = require("cors");


const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use("/chat",chatRouter);


app.listen(process.env.PORT || 5000,()=>{
    console.log("Server is running at port " + process.env.PORT)
});