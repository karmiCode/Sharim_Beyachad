const express = require("express")
const createModelRouter = require("./modelRouteFactory")
const permissionController = require("../controllers/PermissionController")
const requireAction = require("../middleware/requireAction")

const managePermissions = requireAction("permissions")
const router = express.Router()

router.get(
    "/actions",
    managePermissions,
    permissionController.getAvailableActions,
)
router.get("/names", managePermissions, permissionController.getNames)
router.post("/verify-employee-access", permissionController.verifyEmployeeAccess)

router.use(createModelRouter(permissionController, {
    register: managePermissions,
    getAll: managePermissions,
    create: managePermissions,
    getById: managePermissions,
    update: managePermissions,
    remove: managePermissions,
}))

module.exports = router