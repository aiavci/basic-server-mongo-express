/*
 * Copyright (c) 2019 Ali I. Avci
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  rate: {
    type: Number
  }
});

module.exports = Organization = mongoose.model('organization', OrganizationSchema);
