const {
    Create,
    GetOne,
    GetAll,
    Update,
    DeleteOne
} = require('../services/group');

const {
    OK,
    CREATED,
} = require("../../utils/constants");


exports.create = async (req, res, next) => {
    try {
        const response = await Create(req.body)
        return res.status(CREATED).json({
            data: response,
            success: "SUCCESS"
        })
    } catch (err) {
        return next(err)
    }
}

exports.getAll = async (req, res, next) => {
    try {
        const response = await GetAll(req)
        return res.status(OK).json({
            data: response,
            success: "SUCCESS"
        })
    } catch (err) {
        return next(err)
    }
}

exports.getOne = async (req, res, next) => {
    try {
        const response = await GetOne(req.params.id)
        return res.status(OK).json({
            data: response,
            success: "SUCCESS"
        })
    } catch (err) {
        return next(err)
    }
}

exports.update = async (req, res, next) => {
    try {
        const response = await Update(req)
        return res.status(OK).json({
            data: response,
            success: "SUCCESS"
        })
    } catch (err) {
        return next(err)
    }
}

exports.deleteOne = async (req, res, next) => {
    try {
        const response = await DeleteOne(req)
        return res.status(OK).json({
            data: response,
            success: "SUCCESS"
        })
    } catch (err) {
        return next(err)
    }
}