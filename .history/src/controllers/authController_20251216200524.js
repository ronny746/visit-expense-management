const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logActivity } = require('../utils/logger');

/* ================= TOKEN ================= */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

/* ================= REGISTER (PUBLIC – EXECUTIVE ONLY) ================= */
exports.register = async (req, res, next) => {
  try {
    const { employeeId, name, email, password,role, managerId, department } = req.body;

    const user = await User.create({
      employeeId,
      name,
      email,
      password,
      role: role, 
      managerId,
      department,
    });

    await logActivity(user._id, 'USER_REGISTERED', 'user', user._id);

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email & password required' });

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'User is inactive' });

    await logActivity(user._id, 'USER_LOGIN', 'user', user._id);

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      data: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ================= GET LOGGED-IN USER ================= */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('managerId', 'name email');

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/* ================= CREATE USER (ADMIN / HR ONLY) ================= */
exports.createUserByAdmin = async (req, res, next) => {
  try {
    const { employeeId, name, email, password, role, department } = req.body;

    const user = await User.create({
      employeeId,
      name,
      email,
      password,
      role, // admin / hr / manager / finance
      department,
    });

    await logActivity(req.user.id, 'USER_CREATED', 'user', user._id);

    res.status(201).json({
      success: true,
      message: `${role} created successfully`,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
