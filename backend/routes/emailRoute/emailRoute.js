const express = require('express');
const router = express.Router();
const emailControllers = require('../../app/controllers/emailControllers')
const {checkUser} = require('../../app/middlewares/authMiddlewares')



router.post('/invite',checkUser, emailControllers().sendInvitationEmail)



module.exports = router