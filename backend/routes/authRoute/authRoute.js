const express = require('express');
const router = express.Router();
const authControllers = require('../../app/controllers/authcontrollers')


router.post('/signup',authControllers().usersignUp)   //user signup
router.post('/login',authControllers().userLogin)    //user login



module.exports = router