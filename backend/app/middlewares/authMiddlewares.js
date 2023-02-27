const jwt = require('jsonwebtoken')

const UserSchema = require('../models/User')

const checkUser = async (req,res,next)=>{
    try{
        const token = req.cookies.jwt_token;

        if(token){
            jwt.verify(token,process.env.jsonSec,async(err,decodedToken)=>{
                if(err){
                    res.status(403).json({success:false,message:"Token validation failed."})

                }
                else{
                    const userData = await UserSchema.findOne({_id:decodedToken.id})
                    if(userData){
                        req.createdBy = decodedToken.id;
                        if(userData.userPhone[0]==''){
                            req.currentEmailPhone=userData.userEmail[0]
                        }
                        else{
                            req.currentEmailPhone=userData.userPhone[0]  
                        }

                    }
                    next()
                }
            })
        }
        else{
            res.status(401).json({success:false, message:"User validation error"})
        }
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}

module.exports = {checkUser}