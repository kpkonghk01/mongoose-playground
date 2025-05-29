const mongoose = require("mongoose");
const agent = require("./db/setup");

const { Schema, model } = mongoose;

(async () => {
  const TestSchema = new Schema(
    {
      title: {
        type: String,
      },
    },
    { timestamps: true }
  );

  const Test = model("TestSchema", TestSchema);

  const [test] = await Promise.all([
    Test.create({
      title: "hello world",
    }),
  ]);

  let results = await Test.find({}).lean().exec();
  console.log("Created:", JSON.stringify(results, null, 2));

  const findOneSuccess = await Test.findOne({ _id: test._id })
    .orFail()
    .lean()
    .exec();
  console.log("findOneSuccess:", JSON.stringify(findOneSuccess, null, 2));

  const findOneFail = await Test.findOne({ _id: "67eb5f7caede30210f9eaa1c" })
    .lean()
    .exec();
  console.log("findOneFail:", JSON.stringify(findOneFail, null, 2));

  return results;
})().then(
  async (results) => {
    await agent.close();
    process.exit(0);
  },
  async (_) => {
    console.log("throw", _);
    await agent.close();
    process.exit(1);
  }
);
