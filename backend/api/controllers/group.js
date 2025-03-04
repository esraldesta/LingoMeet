const {
  Create,
  GetOne,
  GetAll,
  Update,
  DeleteOne,
} = require("../services/group");

const { OK, CREATED } = require("../../utils/constants");

exports.create = async (req, res, next) => {
  try {
    console.log(req.body, "create");
    const response = await Create(req.body);
    return res.status(CREATED).json({
      data: response,
      success: "SUCCESS",
    });
  } catch (err) {
    return next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const response = await GetAll(req);
    return res.status(OK).json({
      data: response,
      success: "SUCCESS",
    });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};
