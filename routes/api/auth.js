/*
 * Copyright (c) 2019 Ali I. Avci
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');

const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap'
}

const geocoder = NodeGeocoder(options);

// Models
const User = require('../../models/User');
const Address = require('../../models/Address');

// @route   POST api/auth
// @desc    Auth user
// @access  Public
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  console.log('Received request', req.body)

  // Simple validation
  if(!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  // Check for existing user
  const user = await User.findOne({ email });

  if(!user) return res.status(400).json({ msg: 'User Does not exist' });

  // Validate password
  const isMatch = await bcrypt.compare(password, user.password);

  if(!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
  
  jwt.sign(
    { id: user.id },
    config.get('jwtSecret'),
    { expiresIn: 3600 },
    (err, token) => {
      if(err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    }
  )
});

router.get('/me', auth, async (req, res, next) => {
  console.log('Getting me')
  let userId = req.user.id;

  console.log('For userId', userId)

  let user = await User.findById(userId).populate({
    path: 'address'
  });

  console.log('user', user)
  
  res.send({
    user
  });
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
  let user = await User.findById(req.user.id).select('-password');

  res.json({
    user
  });
});

module.exports = router;
