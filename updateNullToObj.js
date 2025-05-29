const R = require("ramda");
const mongoose = require("mongoose");
const agent = require("./db/setup");

const { Schema, model } = mongoose;

const transformUpdateData = R.reject(R.equals(undefined));

const flattenObj = (obj) => {
  const go = (obj_) =>
    R.chain(([k, v]) => {
      if (R.type(v) === "Object" && v.constructor === Object && !R.isEmpty(v)) {
        return R.map(([k_, v_]) => [`${k}.${k_}`, v_], go(v));
      }

      return [[k, v]];
    }, R.toPairs(obj_));

  const isSet = R.has("$set", obj);
  const isUnset = R.has("$unset", obj);
  const isPull = R.has("$pull", obj);
  const isPush = R.has("$push", obj);

  if (isSet || isUnset || isPull || isPush) {
    return {
      ...(isSet ? { $set: R.fromPairs(go(R.prop("$set", obj))) } : {}),
      ...(isUnset ? { $unset: R.fromPairs(go(R.prop("$unset", obj))) } : {}),
      // $pull/$push itself is a query with operators like $in, should not be flatten
      ...(isPull || isPush ? obj : {}),
    };
  }

  return R.fromPairs(go(obj));
};

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
    Story.findByIdAndUpdate(story._id, {
      // we always flatten the obj becoz we got many nested docs
      // FIXME: figure out better solution to resolve the update issue
      ...transformUpdateData(flattenObj({ tag })),
    }),
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
