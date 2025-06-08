const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Get user from context
const getUser = async (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const { userId } = verifyToken(token);
    const user = await User.findByPk(userId);
    return user;
  } catch (error) {
    return null;
  }
};

// Middleware to check if user is authenticated
const requireAuth = (user) => {
  if (!user) {
    throw new Error('You must be logged in to perform this action');
  }
  return user;
};

// Middleware to check if user is admin
const requireAdmin = (user) => {
  const authenticatedUser = requireAuth(user);
  if (authenticatedUser.role !== 'ADMIN') {
    throw new Error('You must be an admin to perform this action');
  }
  return authenticatedUser;
};

// Check if user owns resource or is admin
const requireOwnershipOrAdmin = (user, resourceUserId) => {
  const authenticatedUser = requireAuth(user);
  if (authenticatedUser.role !== 'ADMIN' && authenticatedUser.id !== resourceUserId) {
    throw new Error('You can only access your own resources');
  }
  return authenticatedUser;
};

module.exports = {
  generateToken,
  verifyToken,
  getUser,
  requireAuth,
  requireAdmin,
  requireOwnershipOrAdmin
}; 