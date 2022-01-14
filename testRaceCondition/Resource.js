const { Schema, model } = require('mongoose');

const ResourceSchema = new Schema({
  status: {
    type: String,
  },
});

const Resource = model('Resource', ResourceSchema);

module.exports = Resource;

// Resource
// .find({})
// .cursor()