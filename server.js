const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");

app.use(express.json());

app.use("/admin", adminRouter);
app.use("/user", userRouter);

const connectionDb = async function () {
  await mongoose.connect(process.env.mongo_url);
  console.log("Connected to database");

  app.listen(process.env.port, () => {
    console.log(`Server is running on port ${process.env.port}`);
  });
};

connectionDb();
