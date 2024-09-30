const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const { user, course } = require("../db");

router.post("/signup", async function (req, res) {
  // implement signup logic here
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Please provide all feilds" });
    }
    const existingUser = await user.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        message: "user already exists try using a different username",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await user.create({
      username,
      password: hashedPassword,
    });

    newUser.save();

    const token = jwt.sign(
      { _id: newUser._id, username },
      process.env.jwt_secret
    );

    return res
      .status(200)
      .json({ token, message: "User created successfully" });
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
    const existingUser = await user.findOne({ username });
    if (!existingUser) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { _id: existingUser._id, username }, //adding the id to the payload
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

router.get("/courses", userAuth, async function (req, res) {
  // implement logic to list all the courses
  try {
    const courses = await course.find();
    return res.status(200).json(courses);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something is wrong with the server",
    });
  }
});

router.post("/courses/:courseId", userAuth, async function (req, res) {
  const { courseId } = req.params; // Use courseId directly

  try {
    // Step 1: Check if the course exists
    const foundCourse = await course.findById(courseId);
    if (!foundCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Step 2: Find the user and update the purchasedCourses array
    const updatedUser = await user.findOneAndUpdate(
      { _id: req.userId },
      { $addToSet: { purchasedCourses: courseId } }, // Use $addToSet to avoid duplicates
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Course purchased successfully", user: updatedUser });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong with our server",
    });
  }
});

// router.get("/purchasedCourses", userAuth, async function (req, res) {
//   // implement logic to list all the purchased courses
//   //   Route: GET /users/purchasedCourses
//   // Purpose: List all purchased courses.
//   // Steps:
//   // Authenticate the user using the JWT token.
//   // Retrieve and return the user’s purchased courses.

//   try {
//     const reqUser = await user.findOne({ _id: req.userId });
//     if (!reqUser) {
//       return res.status(400).json({ message: "User not found" });
//     }
//     console.log(reqUser);
//     return res.status(200).json(reqUser.purchasedCourses);
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong with our server",
//     });
//   }
// });

router.get("/purchasedCourses", userAuth, async function (req, res) {
  try {
    const reqUser = await user
      .findOne({ _id: req.userId })
      .populate("purchasedCourses");

    if (!reqUser) {
      return res.status(400).json({ message: "User not found" });
    }

    // Map the purchased courses to the desired output format
    const formattedCourses = reqUser.purchasedCourses.map((course) => ({
      id: course._id, // Assuming you want the ObjectId as 'id'
      title: course.title,
      description: course.description,
      price: course.price,
      imageLink: course.imageLink,
      published: course.published,
    }));

    return res.status(200).json({ purchasedCourses: formattedCourses });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong with our server",
    });
  }
});

module.exports = router;
