const Model = require("../models/group");

exports.Create = async (data) => {
  const response = await Model.create(data);
  return response;
};

exports.GetOne = async (id) => {
  const response = await Model.findById({
    _id: id,
  });
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
    .sort(sort)
    .skip(skip || 0)
    .limit(limit || 1000);
  // .populate("equbType")

  return response;
};

exports.Update = async (req) => {
  const { body } = req;
  const { id } = req.params;
  const response = await Model.updateOne(
    {
      _id: id,
    },
    body
  );
  return response;
};

exports.DeleteOne = async (req) => {
  const { id } = req.params;
  const response = await Model.deleteOne({
    _id: id,
  });

  return response;
};
