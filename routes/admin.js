const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const router = express.Router();
const adminAuth = require("../middlewares/adminAuth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { admin, course } = require("../db");

router.post("/signup", async function (req, res) {
  // implement signup logic here
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Please provide all feilds" });
    }
    const existingAdmin = await admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await admin.create({
      username,
      password: hashedPassword,
    });

    newAdmin.save();

    const token = jwt.sign(
      { _id: existingAdmin._id, username },
      process.env.jwt_secret
    );

    return res
      .status(200)
      .json({ token, message: "Admin created successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.post("/login", async function (req, res) {
  // implement login logic here
  try {
    const { username, password } = req.headers;
    if (!username || !password) {
      return res.status(400).json({ message: "Please provide all feilds" });
    }
    const existingAdmin = await admin.findOne({ username });
    if (!existingAdmin) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingAdmin.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { _id: existingAdmin._id, username }, //adding the id to the payload
      process.env.jwt_secret
    );

    return res.status(200).json({ token, message: "Logged in successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something is wrong with the server",
    });
  }
});

router.post("/courses", adminAuth, async function (req, res) {
  // implement course create logic here
  try {
    const { title, description, price, imageLink, published } = req.body;
    if (!title || !description || !price || !imageLink || !published) {
      return res.status(400).json({ message: "Please provide all feilds" });
    }
    const existingCourse = await course.findOne({ title });
    if (existingCourse) {
      return res.status(400).json({ message: "Course already exists" });
    }

    const newCourse = await course.create({
      title,
      description,
      price,
      imageLink,
      published,
      createdBy: req.adminId, // use the admin id extracted from the token
    });
    newCourse.save();

    return res.status(200).json({ message: "Course created successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something is wrong with our server",
    });
  }
});

router.put("/courses/:courseId", adminAuth, async function (req, res) {
  // implement course update logic here
  const { _id: courseId } = req.params;
  const { title, description, price, imageLink, published } = req.body;
  try {
    //find and update the course
    const updatedCourse = await course.findOneAndUpdate(
      courseId,
      { title, description, price, imageLink, published },
      { new: true, runValidators: true }
    );
    if (!updatedCourse) {
      return res.status(400).json({ message: "Course not found" });
    }
    return res.status(200).json({ message: "Course updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something is wrong with our server",
    });
  }
});

router.get("/courses", adminAuth, async function (req, res) {
  // implement fetching all courses logic here
  try {
    const courses = await course.find({ createdBy: req.adminId });
    return res.status(200).json(courses);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something is wrong with our server",
    });
  }
});

module.exports = router;
