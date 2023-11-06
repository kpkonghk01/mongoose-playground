const mongoose = require("mongoose");
const agent = require("./db/setup");

const { Schema, model } = mongoose;

(async () => {
  const TagSchema = new Schema(
    {
      name: String,
    },
    { timestamps: { createdAt: true, updatedAt: false } }
  );

  const StorySchema = new Schema(
    {
      tag: {
        type: TagSchema,
        default: null,
      },
    },
    { timestamps: true }
  );

  const Story = model("Story", StorySchema);

  const tag = {
    name: "Hot",
  };

  const [story] = await Promise.all([Story.create({})]);

  console.log("Created:", JSON.stringify(story, null, 2));

  await Promise.all([
    Story.updateOne(
      {
        _id: story._id,
      },
      {
        tag,
      }
    ),
  ]);

  let results = await Story.find({}).lean().exec();
  console.log("Updated:", JSON.stringify(results, null, 2));

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
