// const {
//   Worker,
//   isMainThread,
//   parentPort,
//   workerData,
// } = require('worker_threads');
const mongoose = require('mongoose');
const agent = require('./db/setup');

const { Schema, model } = mongoose;

(async () => {
  const PenNameGroupSchema = new Schema(
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    },
    { _id: false, timestamps: { createdAt: true, updatedAt: false } }
  );

  const PenNameSchema = new Schema(
    {
      penNameGroups: {
        type: [PenNameGroupSchema],
        default: [],
      },
    },
    { timestamps: true }
  );

  const PenName = model('PenName', PenNameSchema);

  const penNameGroups = [
    {
      _id: new mongoose.Types.ObjectId(),
    },
    {
      _id: new mongoose.Types.ObjectId(),
    },
    {
      _id: new mongoose.Types.ObjectId(),
    },
  ];

  const [penName] = await Promise.all([
    PenName.create({
      penNameGroups,
    }),
  ]);

  let results = await PenName.find({}).lean().exec();
  console.log('Created:', JSON.stringify(results, null, 2));

  const newPenNameGroups = [
    {
      _id: new mongoose.Types.ObjectId(),
    },
    {
      _id: new mongoose.Types.ObjectId(),
    },
  ];
  const newPenNameGroupIds = newPenNameGroups.map((_) => _._id.toString());

  await new Promise((_) => setTimeout(_, 1000));

  await PenName.findByIdAndUpdate(
    penName._id,
    {
      $push: {
        penNameGroups: {
          $each: newPenNameGroupIds.map((_id) => ({ _id })),
        },
      },
    },
    {
      new: true,
    }
  );

  results = await PenName.find({}).lean().exec();
  console.log('Updated:', JSON.stringify(results, null, 2));

  const deletedPenNameGroupIds = [
    penNameGroups[0],
    penNameGroups[2],
    newPenNameGroups[1],
  ].map((_) => _._id.toString());

  await PenName.findByIdAndUpdate(penName._id, {
    $pull: {
      penNameGroups: {
        _id: {
          $in: deletedPenNameGroupIds,
        },
      },
    },
  });

  results = await PenName.find({}).lean().exec();
  console.log('Deleted:', JSON.stringify(results, null, 2));

  return results;
})().then(
  async (results) => {
    await agent.close();
    process.exit(0);
  },
  async (_) => {
    console.log(_);
    await agent.close();
    process.exit(1);
  }
);
