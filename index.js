const mongod = require("./db/setup");
const mongoose = require('mongoose');
const { Schema, ObjectId, model } = mongoose;

(async () => {
  // example:
  const ImageSchema = new mongoose.Schema({
    imageName: {
      type: String,
      required: true
    }
  });
  const Image = mongoose.model('Image', ImageSchema);

  const TextSchema = new mongoose.Schema({
    textName: {
      type: String,
      required: true
    }
  });
  const Text = mongoose.model('Text', TextSchema);

  const ItemSchema = new Schema({
    objectType: {
      type: String,
    },
  }, {
    discriminatorKey: 'objectType',
    _id: false,
  });

  const InternalItemSchemaGen = () => new Schema({
    data: {
      type: ObjectId,
      refPath: 'list.objectType',
    },
  }, {
    _id: false,
  });

  const ExternalItemSchemaGen = () => new Schema({
    data: {
      sourceId: {
        type: Number,
        required: true,
      },
    },
  }, {
    _id: false,
  });

  const NestedDataSchema = new Schema({
    data: new Schema({
      title: {
        type: String,
      },
      description: {
        type: String,
      },
    }, {
      _id: false,
    }),
  }, {
    _id: false,
  });

  const ExampleSchema = new Schema({
    test: {
      type: String,
    },
    list: [{
      type: ItemSchema,
      required: false
    }],
  });
  ExampleSchema.path('list').discriminator('Image', InternalItemSchemaGen());
  ExampleSchema.path('list').discriminator('Text', InternalItemSchemaGen());
  ExampleSchema.path('list').discriminator('ExternalSource', ExternalItemSchemaGen());
  ExampleSchema.path('list').discriminator('NestedData', NestedDataSchema);
  const Example = model('Example', ExampleSchema);

  const image1 = await Image.create({
    imageName: '01image',
  });
  const text2 = await Text.create({
    textName: '02text',
  });

  // this datum cause the error
  // when data inside list have no _id and the find result include this data will cause
  await Example.create({
    test: 'example',
    list: [
      {
        data: {
          sourceId: 123
        },
        objectType: 'ExternalSource',
      },
      {
        data: {
          title: "Aut porro",
          description: "Iusto cumque iste officiis.",
        },
        objectType: 'NestedData',
      },
    ],
  });

  await Example.create({
    test: 'example',
    list: [
      {
        data: image1._id,
        objectType: 'Image',
      },
      {
        data: text2._id,
        objectType: 'Text',
      },
      {
        data: {
          sourceId: 123
        },
        objectType: 'ExternalSource',
      },
      {
        data: {
          title: "Aut porro",
          description: "Iusto cumque iste officiis.",
        },
        objectType: 'NestedData',
      },
    ],
  });
  const query = Example
    .find({})
    .populate({
      path: 'list.data',
      options: { lean: true },
    })
    .lean()
    .skip(0);
  const results = await query.exec();
  return results;
})().then(
  async result => {
    await mongoose.disconnect();
    await mongod.stop();
    process.exit(0);
  },
  async _ => {
    console.log(_);
    await mongoose.disconnect();
    await mongod.stop();
    process.exit(1);
  }
)
