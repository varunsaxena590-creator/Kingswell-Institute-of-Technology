const courses = require("../data/courses");

function getCourses(req, res) {
  res.json({
    success: true,
    data: courses,
  });
}

function getCourseById(req, res) {
  const courseId = Number(req.params.id);
  const course = courses.find((item) => item.id === courseId);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  return res.json({
    success: true,
    data: course,
  });
}

module.exports = {
  getCourses,
  getCourseById,
};
