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
  const TestSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      meta: {
        type: mongoose.Schema.Types.Mixed,
      },
    },
    { timestamps: true, minimize: false }
  );

  const Test = model('Test', TestSchema);

  const [test] = await Promise.all([
    Test.create({
      name: 'test',
      meta: {
        foo: 'a',
        bar: {},
      },
    }),
  ]);

  let results = await Test.find({}).lean().exec();
  console.log('Created:', JSON.stringify(results, null, 2));

  await new Promise((_) => setTimeout(_, 1000));

  await Test.findByIdAndUpdate(
    test._id,
    {
      meta: {
        foo: 'b',
        bar: {},
      },
    },
    {
      new: true,
    }
  );

  results = await Test.find({}).lean().exec();
  console.log('Updated:', JSON.stringify(results, null, 2));

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
