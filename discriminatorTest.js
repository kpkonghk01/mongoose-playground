const mongoose = require('mongoose');
const agent = require('./db/setup');

const { Schema, model } = mongoose;

(async () => {
  const ResourceSchema = new Schema({
    channel: {
      type: Number,
    },
    demo: {
      type: String,
    },
  });

  const ResourceMissingChannelSchema = new Schema({
    channel: {
      type: Number,
    },
    demo: {
      type: String,
    },
  });

  const Resource = model('Resource', ResourceSchema);

  const ResourceMissingChannel = Resource.discriminator('MissingChannel', ResourceMissingChannelSchema);

  ResourceMissingChannel.schema.remove('channel');
  const [z0] = await Promise.all([
    ResourceMissingChannel.create({
      channel: 456,
      demo: 'hello world 4',
    }),
  ]);

  ResourceMissingChannel.schema.add({
    channel: {
      type: Number,
    }
  });

  const [x, y, z] = await Promise.all([
    Resource.create({
      channel: 123,
      demo: 'hello world 1',
    }),
    Resource.create({
      channel: 234,
      demo: 'hello world 2',
    }),
    ResourceMissingChannel.create({
      channel: 456,
      demo: 'hello world 3',
    }),
  ]);

  await Resource.updateOne(
    {
      _id: x._id
    }, {
    $unset: {
      channel: 1,
    }
  });

  const results = await Resource
    .find({})
    .lean()
    .exec();

  return results;
})().then(
  async (result) => {
    await agent.stop();
    process.exit(0);
  },
  async (_) => {
    console.log(_);
    await agent.stop();
    process.exit(1);
  }
);
