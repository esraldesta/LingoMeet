const router = require("express").Router();
const controller = require("../controllers/group");
const { validate } = require("express-validation");
const { createGroup } = require("../validations/group");

router.route("/")
    .get(controller.getAll)
    .post(validate(createGroup),controller.create)



module.exports = router;