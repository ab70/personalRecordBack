const express = require('express');
const router = express.Router();
const userControllers = require('../../app/controllers/userControllers')
const {checkUser} = require('../../app/middlewares/authMiddlewares')


router.post('/getuser',userControllers().findUser)  //find user from frontend (email/phone)

router.get('/searchuser/:userinfo', checkUser, userControllers().findUserOfMyTransaction)



module.exports = router
