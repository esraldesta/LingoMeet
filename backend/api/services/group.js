const Model = require("../models/group");

exports.Create = async (data) => {
  const response = await Model.create(data);
  return response;
};


exports.GetAll = async (req) => {
  const { limit, page, queryName, searchQuery, sort } = req.query;
  const skip = (page - 1) * (limit || 10);
  let filter = {};

  if (searchQuery) {
    const regex = new RegExp(searchQuery, "i");

    filter = {
      $or: [
        { title: { $regex: regex } },
        { Topic: { $regex: regex } },
        { language: { $regex: regex } },
      ],
    };
  }

  const response = await Model.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip || 0)
    .limit(limit || 1000);
  // .populate("equbType")

  return response;
};

exports.DeleteOne = async (req) => {
  const { id } = req.params;
  const response = await Model.deleteOne({
    _id: id,
  });

  return response;
};
