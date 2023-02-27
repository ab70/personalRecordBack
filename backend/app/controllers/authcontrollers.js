const CryptoJs = require('crypto-js')
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')
const UserSchema = require('../models/User')
const {transactionSchema} = require('../models/Transaction')

function authControllers() {
    return {
        //user signup
        async usersignUp(req, res) {
            try {
                console.log(req.body);
                // await UserSchema.deleteMany()
                if (((req.body.userEmail === "") && (req.body.userPhone === "")) || (req.body.userPass.trim() === "")) {
                    res.status(400).json({ success: false, message: "Please provide credentials properly." })

                }
                else {
                    const searchUser = await UserSchema.find({
                        $or: [
                            {
                                $and: [
                                    {
                                        userEmail: req.body.userEmail,
                                    },
                                    { userEmail: { $ne: '' } }
                                ]
                            }
                            ,
                            {
                                $and: [
                                    {
                                        userPhone: req.body.userPhone,
                                    },
                                    { userPhone: { $ne: '' } }
                                ]
                            }
                        ]
                    }).select("userPass")
                    
                    if (searchUser.length > 0) {
                        res.status(403).json({
                            success: false,
                            message: "User already exist, please Login"
                        })
                    } else {
                        const reqBody = new UserSchema({
                            userName: req.body.userName,
                            userEmail: req.body.userEmail,
                            userPhone: req.body.userPhone,
                            userPass: CryptoJs.AES.encrypt(req.body.userPass, process.env.SECRET_KEY),
                        })
                        const saveUser = await reqBody.save()

                        if(saveUser) {


                            res.status(200).json({
                                success: true,
                                message: "User registration Done"
                            })
                        }  else{
                            res.status(404).json({
                                success: false,
                                message: "User registration failed"
                            })
                        } 

                    }
                }

            } catch (e) {
                console.log(e);
                res.status(500).json({
                    success: false,
                    message: e.message
                });
            }
        },

        //userLogin
        async userLogin(req, res) {
            try {
                const searchUser = await UserSchema.findOne({
                    $or: [{
                        userEmail: req.body.userEmailPhone.trim()
                    }, {
                        userPhone: req.body.userEmailPhone.trim()
                    }]
                }).select("userPass")

                if (searchUser) {
                    const hasedPass = CryptoJs.AES.decrypt(searchUser.userPass, process.env.SECRET_KEY).toString(CryptoJs.enc.Utf8);

                    if (hasedPass !== req.body.userPass.trim()) {
                        res.status(403).json({ success: false, message: "Please check your credentials." });

                    }
                    else {
                        const token = jwt.sign({ id: searchUser._id, role: searchUser.userType }, process.env.jsonSec);

                        const { userPass, createdAt, updatedAt, ...others } = searchUser._doc;
                        //this is session storing line 
                        // req.session.currentUser = others;  
                        //can be added {sameSite:"none",httpOnly:true,secure:true}
                        // res.cookie("jwt_token", token, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true, secure: true, sameSite: false });
                        req.session.currentUser= others
                        res.cookie('jwt_token', token ,{ expires: new Date((new Date()).getTime() + (10 * 86400000)), secure:true, httpOnly:true, sameSite:'none' } )
                        res.status(200).json({ success: true, message: "User Logged in!", data:others})

                    }
                }
                else {
                    res.status(401).json({ success: false, message: "User doesn't exist. Please sign up!" });
                }


            } catch (e) {
                res.status(500).json({ success: false, message: e.message })
            }
        },


        //test signup controller
        async testSignup(req,res){
            try {
                // await UserSchema.deleteMany()
                if (((req.body.userEmail === "") && (req.body.userPhone === "")) || (req.body.userPass.trim() === "")) {
                    res.status(400).json({ success: false, message: "Please provide credentials properly." })

                }
                else {
                    const searchUser = await UserSchema.find({
                        $or: [
                            {
                                $and: [
                                    {
                                        userEmail: req.body.userEmail,
                                    },
                                    { userEmail: { $ne: '' } }
                                ]
                            }
                            ,
                            {
                                $and: [
                                    {
                                        userPhone: req.body.userPhone,
                                    },
                                    { userPhone: { $ne: '' } }
                                ]
                            }
                        ]
                    }).select("userPass")
                    
                    if (searchUser.length > 0) {
                        res.status(403).json({
                            success: false,
                            message: "User already exist, please Login"
                        })
                    } else {
                        const reqBody = new UserSchema({
                            userName: req.body.userName,
                            userEmail: req.body.userEmail,
                            userPhone: req.body.userPhone,
                            userPass: CryptoJs.AES.encrypt(req.body.userPass, process.env.SECRET_KEY),
                        })
                        const saveUser = await reqBody.save()

                        if(saveUser) {
                            let searchVar=reqBody._id
                            const searchedUser = await transactionSchema.find({
                                $or:[{
                                    'sender.senderEmailPhone':req.body.userEmail
                                },
                                {
                                    'sender.senderEmailPhone':req.body.userPhone
                                },
                                {
                                    'receiver.receiverEmailPhone':req.body.userEmail
                                },
                                {
                                    'receiver.receiverEmailPhone':req.body.userPhone
                                }
                            ]
                            })

                            res.status(200).json({
                                success: true,
                                message: "User registration Done"
                            })
                        }  else{
                            res.status(404).json({
                                success: false,
                                message: "User registration failed"
                            })
                        } 

                    }
                }

            } catch (e) {
                res.status(500).json({
                    success: false,
                    message: e.message
                });
            }
        },

        
    }
}

module.exports = authControllers