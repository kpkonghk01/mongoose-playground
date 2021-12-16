const {
  Worker, isMainThread, parentPort, workerData
} = require('worker_threads');
const mongoose = require('mongoose');
const agent = require('./db/setup');

const { Schema, model } = mongoose;

(async () => {
  const ArticleSchema = new Schema({
    status: {
      type: String,
    },
  });

  const Article = model('Article', ArticleSchema);

  const [article] = await Promise.all([
    Article.create({
      status: 'failed',
    })
  ]);

  await Article.updateOne(
    {
      _id: article._id
    }, {
    $set: {
      status: 'processing',
    }
  });

  const results = await Article
    .find({})
    .lean()
    .exec();

  return results;
})().then(
  async (result) => {
    await agent.close();
    process.exit(0);
  },
  async (_) => {
    console.log(_);
    await agent.close();
    process.exit(1);
  }
);
