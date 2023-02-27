const UserSchema = require('../models/User')
const mongoose = require('mongoose')
const {transTypeSchema, transactionSchema} = require('../models/Transaction')

function userControllers(){
    return{
        //user search
        async findUser(req,res){
            try{
                const findUserData = await UserSchema.findOne({
                    $or:[
                        {userEmail:req.body.userEmailPhone.trim()},
                        {userPhone:req.body.userEmailPhone.trim()}
                    ]
                })
                findUserData ? res.json({success:true, message:"Registered User", data: findUserData})
                :
                res.json({success:false,message:"User not foound",data:findUserData})
            }
            catch(er){
                res.status(500).json({success:false,message:er.message})
            }
        },

        // search user by (email or phone number or username) in my transaction list

        /**
         * It finds the user of the transaction by searching for the user's email, phone number or
         * username and then finds the transaction between the logged in user and the searched user
         */
        async findUserOfMyTransaction(req,res){
            try{
                const currentUser = req.createdby
                const loggedUser = mongoose.Types.ObjectId(currentUser)  

                /* Finding the user of the transaction by searching for the user's email, phone number
                or
                         * username and then finds the transaction between the logged in user and
                the searched user */
                const findUserData = await UserSchema.findOne({
                    $or:[
                        {userEmail: req.params.userinfo},
                        {userPhone: req.params.userinfo},
                        {userName:  req.params.userinfo}
                    ]
                }).select('userName userEmail userPhone')
                
                if(findUserData){

                    const searcheduser = mongoose.Types.ObjectId(findUserData._id.toString())
                    
                    const searchedTransactions = await transactionSchema.find({
                        $or:[
                        {   
                            $or:[
                                {'sender.senderId':searcheduser},
                                {'receiver.receiverId':loggedUser}
                            ]
                            
                        },
                        {
                            $or:[
                                {'sender.senderId':loggedUser},
                                {'receiver.receiverId':searcheduser}
                            ]
                        }
                    ]})
                    
                    searchedTransactions.length>0 ? res.status(200).json({success:true, message:"Transaction found",data:searchedTransactions})
                    :
                    res.status(204).json({success:false,message:"No transactions",data:searchedTransactions})
                }
                else{
                    res.status(400).json({success:false,message:"No users found"})
                }
            }
            catch(err){
                res.status(500).json({success:false, message:err.message})
            }
        }
        
        
    }
}

module.exports= userControllers