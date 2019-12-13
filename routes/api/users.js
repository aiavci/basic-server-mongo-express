const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');

const User = require('../../models/User');

// @route   POST api/users
// @desc    Register new user
// @access  Public
router.post('/', (req, res) => {
  const { name, email, password, permissions, projects } = req.body;

  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  // Check for existing user
  User.findOne({ email })
    .then(user => {
      if (user) return res.status(400).json({ msg: 'User already exists' });

      const newUser = new User({
        name,
        email,
        password,
        permissions,
        projects
      });

      // Create salt & hash
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save()
            .then(user => {
              jwt.sign(
                { id: user.id },
                config.get('jwtSecret'),
                { expiresIn: 3600 },
                (err, token) => {
                  if (err) throw err;
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
        })
      })
    })
});

// @route   PUT api/users
// @desc    Update new user
// @access  Private
router.put('/', auth, async (req, res) => {
  const { password, password2, email } = req.body;

  if (password !== password2) {
    return res.status(500).send('{errors: "Passwords don\'t match"}').end();
  }

  if (email == null) {
    return res.status(500).send('{errors: "User email is invalid"}').end();
  }

  try {
    const user = await User.findOne({ email });

    const salt = await bcrypt.genSalt(10);

    const hash = await bcrypt.hash(password, salt);

    await User.updateOne({ email }, { password: hash });

    return res.send(user);
  } catch (error) {
    return res.status(500).send('{errors: "An error ocurred when saving user"}').end();
  }
});

// @route GET api/users
// @desc Gets all users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find();

    return res.send(users);
  } catch (err) {
    console.error(err);

    return res.status(500).send('{errors: "An error ocurred when getting users"}').end();
  }
});

module.exports = router;
