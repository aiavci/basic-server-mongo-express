const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');

const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap'
}

const geocoder = NodeGeocoder(options);

const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Address = require('../../models/Address');

// @route   POST api/users
// @desc    Register new user
// @access  Public
router.post('/', (req, res) => {
  const { firstName, lastName, email, password, permissions, projects } = req.body;

  // Simple validation
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  // Check for existing user
  User.findOne({ email })
    .then(user => {
      if (user) return res.status(400).json({ msg: 'User already exists' });

      const newUser = new User({
        first_name: firstName,
        last_name: lastName,
        email,
        password
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
                      first_name: user.first_name,
                      last_name: user.last_name,
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
router.put('/', auth, async (req, res, next) => {
  const { password, password2, name, email } = req.body;

  if (password2 && password !== password2) {
    return res.status(500).send('{errors: "Passwords don\'t match"}').end();
  } else if (name == null) {
    return res.status(500).send('{errors: "Please enter information to update"}').end();
  }

  if (email == null) {
    return res.status(500).send('{errors: "User email is invalid"}').end();
  }

  let updatedData = {};

  try {
    let user = await User.findOne({ email });

    if (password2) {
      const salt = await bcrypt.genSalt(10);

      const hash = await bcrypt.hash(password2, salt);

      updatedData.password2 = hash;
    }

    if (name) {
      updatedData.name = name;
    }

    user = await User.updateOne({ email }, updatedData);

    return res.send(user);
  } catch (error) {
    console.error(error);

    return res.status(500).send('{errors: "An error ocurred when saving user"}').end();
  }
});

router.post('/address', auth, async (req, res, next) => {
  let userId = req.user.id;

  let user = await User.findById(userId);

  const {
    addressLine1,
    addressLine2,
    city,
    province,
    postalCode,
    country
  } = req.body;

  console.log('Check body', req.body)

  let address = null;
  if (user.address) {
    // If user already has an address, update it
    address = await Address.findById(user.address);
    address.addressLine1 = addressLine1;
    address.addressLine2 = addressLine2;
    address.city = city;
    address.province = province;
    address.postalCode = postalCode;
    address.country = country;
  } else {
    address = new Address({
      addressLine1,
      addressLine2,
      city,
      province,
      postalCode,
      country
    });
  }

  let geoCodedData = null;
  try {
    let addressAsString = addressLine1;
    
    if (addressLine2) {
      addressAsString += ' ' + addressLine2;
    }

    geoCodedData = await geocoder.geocode({
      address: addressAsString,
      city,
      country: 'Canada',
      postalcode: postalCode
    });
    geoCodedData = geoCodedData[0] || {};
  } catch(err) {
    console.error('An error occurred', err)
  }

  console.log('geoCodedData', geoCodedData)

  address.latitude = geoCodedData.latitude;
  address.longitude = geoCodedData.longitude;

  console.log('address', address)

  address = await address.save()

  user.address = address.id;

  await user.save()

  res.send({
    success: true
  })
})

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
