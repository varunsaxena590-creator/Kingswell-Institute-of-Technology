function createContact(req, res) {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email and message are required",
    });
  }

  return res.status(201).json({
    success: true,
    message: "Contact form submitted successfully",
    data: {
      name,
      email,
      phone: phone || "",
      message,
    },
  });
}

module.exports = {
  createContact,
};
