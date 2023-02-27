const mongoose = require('mongoose')
const UserSchema = require('../models/User')
const {transTypeSchema, transactionSchema} = require('../models/Transaction')
function testControllers(){
    return{
        //base test routes
        index(req,res){
            console.log(req.body);
            res.status(200).json({ success:true, message: "test route is working", data: req.body})
        },
        
        //get data of trans with stat
        async getData(req,res){
            try{
                const  otherUser='63e8ece2b7c5094a0bdd6f6d'
                // const loggedUser =req.createdBy
                const  loggedUser ='63e348b37aa315ce214439c4' 
                const allLoans = await transactionSchema.find({
                    $or:[
                        {
                            $and:[
                                {"sender.senderId":loggedUser},{"receiver.receiverId":otherUser}
                            ]
                        },
                        {
                            $and:[
                                {"sender.senderId":otherUser},{"receiver.receiverId":loggedUser}
                            ]   
                        }
                    ]
                }).populate("sender.senderId receiver.receiverId")

                let twoUsersData ={
                    userATrans:[],
                    userBTrans:[],
                }
                let userASent=userAReceived=userBSent=userBReceived=0

                /* The above code is mapping through all the loans and checking if the sender is the
                logged in user. If the sender is the logged in user, then it is pushing the data to
                the userA array. If the sender is not the logged in user, then it is pushing the
                data to the userB array. */
                allLoans.map(e=>{
                    console.log(e.sender.senderId._id.toString());
                    console.log(loggedUser)
                    if(e.sender.senderId._id.toString()==loggedUser){
                        console.log("same")
                        let a={
                            type:"sent",
                            amount:e.amount,
                        }
                        let b ={
                            type:"received",
                            amount:e.amount
                        }
                        userASent=userASent+e.amount
                        userBReceived=userBReceived+e.amount
                        twoUsersData.userATrans.push(a)
                        twoUsersData.userBTrans.push(b)
                    }
                    else if(e.receiver.receiverId._id.toString()==loggedUser){
                        console.log('ue');
                        let b={
                            type:"sent",
                            amount:e.amount,
                        }
                        let a ={
                            type:"received",
                            amount:e.amount
                        }
                        userBSent=userBSent+e.amount
                        userAReceived=userAReceived+e.amount
                        twoUsersData.userATrans.push(a)
                        twoUsersData.userBTrans.push(b)
                    }
                })
                twoUsersData.userASent=userASent
                twoUsersData.userAReceived= userAReceived
                twoUsersData.userBSent= userBSent
                twoUsersData.userBReceived= userBReceived
                twoUsersData.userAFinalStat=userASent-userAReceived
                twoUsersData.userBFinalStat= userBSent-userBReceived 
                

                res.status(200).json({success:true, message:"Found all transaction", data:twoUsersData})


            }
            catch(err){
                res.status(500).json({success:false, message:err.message})
            }
        },

      
        /* Getting the summary of the user. */
        async getFullUserSummary(req,res){
            try{
              const currentUser = req.createdby
              const loggedUser = mongoose.Types.ObjectId(currentUser)  
              console.log(loggedUser);
              
              const getData = await transactionSchema.aggregate([
                {
                  $match:{
                    $or: [
                      {
                        "sender.senderId": loggedUser,
                      },
                      {
                        "receiver.receiverId":loggedUser
                      }
                    ]
                  }
                 
                },
                //seperate two of them
                {
                  $facet:{
                    sent_trans: [ {$match:{"sender.senderId":loggedUser}},{$group:{_id:null,total_sent:{$sum:"$amount"}}} ],
                    received_trans:[{$match:{"receiver.receiverId":loggedUser}},{$group:{_id:null,total_received:{$sum:"$amount"}}}]
                  }
                },
                //projection
                {
                  $project:{

                    total_sent: { $arrayElemAt: ["$sent_trans.total_sent", 0] },
                    total_received: { $arrayElemAt: ["$received_trans.total_received", 0] }
                  }
                }
              ])
              
                res.status(200).json({success:true,message:"Summary fetch done",data:getData})

            }
            catch(err){
              console.log(err);
            }
        },

        /**
         * It gets all the users from the database
        */
        async getAllUsers(req,res){
          try{
            const allUser = await UserSchema.find({}).select('_id')
            console.log(allUser.length);
            allUser ? res.status(200).json({success:true,message: "user found",data:allUser})
            :
            res.status(403).json({success:false,message:"No user data"})
          }
          catch(err){
            res.status
          }
        }
    }
}

module.exports = testControllers