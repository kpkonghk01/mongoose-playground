const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const agent = require("./db/setup");

const { Schema, model } = mongoose;

(async () => {
  const ItemSchema = new Schema(
    {
      seqId: {
        type: Number,
      },
    },
    { _id: true }
  );
  ItemSchema.plugin(AutoIncrement, {
    inc_field: "seqId",
    // This is buggy, expect item to have seqId 1 but got 2, always starts +1, not as documented
    start_seq: 1, // Starting value for the sequence, use the default value
  });

  const Item = model("Item", ItemSchema);

  // Both of these create a new item with seqId 2
  // const item = await new Item().save();
  const item = await Item.create({});

  let results = await Item.find({}).lean().exec();
  console.log("Created:", JSON.stringify(results, null, 2));

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
