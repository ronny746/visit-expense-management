const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logActivity } = require('../utils/logger');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res, next) => {
  try {
    const { employeeId, name, email, password, role, managerId, department } = req.body;

    const user = await User.create({
      employeeId,
      name,
      email,
      password,
      role,
      managerId,
      department
    });

    await logActivity(user._id, 'USER_REGISTERED', 'user', user._id, `User ${name} registered`);

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive'
      });
    }

    await logActivity(user._id, 'USER_LOGIN', 'user', user._id, `User ${user.name} logged in`);

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      data: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('managerId', 'name email');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};