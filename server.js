const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const chatRoute = require("./routes/chat");
const authRoutes = require("./routes/authRoutes");
const upgradeRoutes = require("./routes/upgrade");
const adminRoutes = require("./routes/admin");
const settingsRoutes = require("./routes/settingsRoutes");


const demoUsersRoutes = require("./routes/demoUsers");

dotenv.config();

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.LANDING_PAGE_URL, process.env.DASHBOARD_URL],
    credentials: true, // allow cookies
  })
);
app.use((req, res, next) => {
  console.log("📩 Incoming request:", req.method, req.url);
  next();
});


app.use("/api", chatRoute);
app.use("/api/auth", authRoutes);
app.use("/api/upgrade", upgradeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/demo", demoUsersRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/ping", (req, res)=>{
  try{
    res.status(200).json({res: "pong"});
  } catch(e){
    console.log("Pong failed");
    console.log(e);
  }
});



app.listen(PORT, async () => {
  console.log("Server Started " + PORT);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected with Mongo");
  } catch (err) {
    console.log("Failed to Connect with DB " + err);
  }
});
