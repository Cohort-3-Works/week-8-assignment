const mongoose = require("mongoose");

const schema = mongoose.Schema;
// const ObjectId = mongoose.Types.ObjectId;

mongoose.connect(
  "mongodb+srv://subh:nainasweetheart@corsify.e5aej.mongodb.net/coursify"
);

const adminSchema = new schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const userSchema = new schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "course" }],
});

const courseSchema = new schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageLink: { type: String },
  published: { type: Boolean, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true,
  },
});

// Relationships i wrote -->

// Admin to course --> Each admin can create multiple courses --> one to many
// User to course --> Each user can purchase multiple courses --> many  to many
// course to user --> each course can be purchased by multiple users --> many to many

const admin = mongoose.model("admin", adminSchema);
const user = mongoose.model("user", userSchema);
const course = mongoose.model("course", courseSchema);

module.exports = {
  admin,
  user,
  course,
};
