const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ResourceSchema = new Schema({
  demo: {
    type: String,
  },
});

const Resource = model('Resource', ResourceSchema);

module.exports = {
  Resource,
  cursor: Resource
    .find({})
    .cursor(),
}