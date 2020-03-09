/*
 * Copyright (c) 2019 Ali I. Avci
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  address: { type:  mongoose.Schema.Types.ObjectId, ref: 'address' }
});

module.exports = User = mongoose.model('user', UserSchema);
