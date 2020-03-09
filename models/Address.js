/*
 * Copyright (c) 2019 Ali I. Avci
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
  addressLine1: String,
  addressLine2: String,
  city: String,
  province: String,
  postalCode: String,
  latitude: Number,
  longitude: Number,
  trees: [{ type:  mongoose.Schema.Types.ObjectId, ref: 'Tree' }]
});

module.exports = Address = mongoose.model('address', AddressSchema);
