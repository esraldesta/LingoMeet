const { Schema, model } = require("mongoose");

const Group = new Schema(
  {
    // owner: {
    //     type: Schema.Types.ObjectId,
    //     ref: "equbTypes",
    //     required: true
    // },
    title: {
      type: String,
      required: true,
    },
    Topic:{
      type: String,
    },
    languages: {
      type: [String],
      required:true
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("groups", Group);
