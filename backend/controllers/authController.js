const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
// Helper to generate JWT
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), normalizedEmail, hashedPassword]
    );

    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: normalizedEmail
    };

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please check database connection.'
    });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query user
    const [rows] = await db.query(
      'SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    const token = generateToken(userData);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please check database connection.'
    });
  }
}

// GET /api/auth/me (Protected)
async function getMe(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: rows[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
}

module.exports = {
  register,
  login,
  getMe,
  logout
};
