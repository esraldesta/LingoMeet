const router = require("express").Router();
const controller = require("../../controllers/group");
router.route("/")
    .get(controller.getAll)
    .post(controller.create)

    router.route("/:id")
    .get(controller.getOne)
    .put(controller.update)
    .delete(controller.deleteOne)


module.exports = router;