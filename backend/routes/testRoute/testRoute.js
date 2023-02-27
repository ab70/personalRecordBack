const express = require('express');
const router = express.Router();
const testControllers = require("../../app/controllers/testControllers")
const {checkUser} = require('../../app/middlewares/authMiddlewares')
/*  simple test route for the post request. */
router.post('/', testControllers().index)
router.get('/getsum',testControllers().getData)

router.get('/getusersum',testControllers().getFullUserSummary)

//get all user in an array
router.get('/allusers',testControllers().getAllUsers)


module.exports = router