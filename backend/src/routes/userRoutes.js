const express = require("express");

const {
    getUsers,
    createUser,
    updateUserRole,
    updateUserActive
} = require("../controllers/userController");

const {
    verifyToken,
    authorize
} = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken);
router.use(authorize(["ADMIN"]));

router.get("/", getUsers);
router.post("/", createUser);
router.patch("/:id/role", updateUserRole);
router.patch("/:id/active", updateUserActive);

module.exports = router;