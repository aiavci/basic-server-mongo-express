/*
 * Copyright (c) 2019 Ali I. Avci
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coordinates = new Schema({
  lat: {
    type: Number
  },
  long: {
    type: Number
  }
})

const TreeSchema = new Schema({
  tree_name: {
    type: String,
    required: true
  },
  tree_type: {
    type: String
  },
  coordinates: Location
});

module.exports = Tree = mongoose.model('tree', TreeSchema);
