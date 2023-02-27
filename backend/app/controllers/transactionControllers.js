const { default: mongoose } = require('mongoose')
const {transTypeSchema, transactionSchema} = require('../models/Transaction')
const UserSchema = require('../models/User')
const {PaginationConsts} = require('../constants/constants')


function transactionControllers(){
    return{
        //create a transaction type
        async createTransactionsType(req,res){
            try{
                if(req.body.en_typeName.trim()===""){
                    res.status(400).json({success:false, message:"Must provide type name"})
                }
                else{
                    const findThatName = await transTypeSchema.find({en_typeName:req.body.en_typeName})
                    if(findThatName.length>0){
                        res.status(409).json({success:false,message:"This type already exist"})
                    }
                    else{

                        const cType = new transTypeSchema({
                            en_typeName:req.body.en_typeName
                        })
                        const saveData = await cType.save()
                        saveData ? res.status(200).json({success:true,message:"Transaction type saved"})
                        :
                        res.status(401).json({success:false,message:"Can't save data"})
                    }

                }
            }
            catch(err){
                res.status(500).json({success:false,message:err.message})
            }
        },

        //get all transaction types
        async getAllTransactionTypes(req,res){
            try{
                const allType = await transTypeSchema.find({})
                allType.length>0 ? res.status(200).json({success:true,message:"data found",data: allType})
                :
                res.status(400).json({success:false,message:"Can't find any data"})
            }
            catch(err){
                res.status(500).json({success:false,message:err.message})
            }
        },

        //create new transactions
        async createTransactions(req,res){
            try{
                // await transactionSchema.deleteMany()
                const receiverIDs = req.body.receiver.receiverId.replace(/['"]+/g,'').trim();
                const senderIDs = req.body.sender.senderId.replace(/['"]+/g,'').trim();
                
                creator = req.createdBy.trim();
                
                
                if(senderIDs===req.createdBy || receiverIDs===req.createdBy){
                    //if both comes and both valid user
                    if(mongoose.Types.ObjectId.isValid(senderIDs) && mongoose.Types.ObjectId.isValid(receiverIDs)){
    
                        const reqBody = new transactionSchema({
                            type: req.body.type,
                            createdBy: req.createdBy,
                            amount:req.body.amount,
                            sender: {
                                senderEmailPhone: req.body.sender.senderEmailPhone,
                                senderId: senderIDs,
                            },
                            senderStatus: req.body.senderStatus,
                            receiver:{
                                receiverEmailPhone:req.body.receiver.receiverEmailPhone,
                                receiverId:receiverIDs
                            },
                            receiverStatus:req.body.receiverStatus.trim()
                        })
                        const saveData = await reqBody.save()
                        saveData ? res.status(200).json({success:true,message:"Transaction saved"})
                        :
                        res.status(400).json({success:false,message: "Cant save data.(Both Id found)"})
                    }
                    //if senderId Comes
                    else if(mongoose.Types.ObjectId.isValid(senderIDs) && !(mongoose.Types.ObjectId.isValid(receiverIDs))){
                        let reqBodys = {
                            type: req.body.type,
                            createdBy: req.createdBy,
                            amount:req.body.amount,
                            sender: {
                                senderEmailPhone: req.currentEmailPhone,
                                senderId: senderIDs,
                            },
                            senderStatus: req.body.senderStatus,
                            receiver:{
                                receiverEmailPhone:req.body.receiver.receiverEmailPhone,
                            },
                            receiverStatus:req.body.receiverStatus.trim()
                        }
                        console.log(reqBodys);
                        const findUserData = await UserSchema.findOne({
                            $or:[
                                {userEmail:req.body.receiver.receiverEmailPhone.trim()},
                                {userPhone:req.body.receiver.receiverEmailPhone.trim()}
                            ]
                        })
                        console.log(findUserData);
                        if(findUserData) {
                            let objIDs = findUserData._id.toString().trim()
                            console.log(objIDs);
                            reqBodys.receiver['receiverId']=objIDs
                        }
                        console.log(reqBodys);
                        let matchBodys = new transactionSchema(reqBodys)
                        
                        const saveData = await matchBodys.save()
                        saveData ? res.status(200).json({success:true,message:"Transaction saved"})
                        :
                        res.status(400).json({success:false,message: "Cant save data.(Both Id found)"})
                    }
                    //if only receiver id comes
                    else if(!(mongoose.Types.ObjectId.isValid(senderIDs)) && mongoose.Types.ObjectId.isValid(receiverIDs)){
                        
                        let reqBody = {
                            type: req.body.type,
                            createdBy: req.createdBy,
                            amount:req.body.amount,
                            sender: {
                                senderEmailPhone: req.body.sender.senderEmailPhone,
                            },
                            senderStatus: req.body.senderStatus,
                            receiver:{
                                receiverEmailPhone: req.currentEmailPhone,
                                receiverId: receiverIDs
                            },
                            receiverStatus:req.body.receiverStatus.trim()
                        }
                        const findUserData = await UserSchema.findOne({
                            $or:[
                                {userEmail:req.body.sender.senderEmailPhone.trim()},
                                {userPhone:req.body.sender.senderEmailPhone.trim()}
                            ]
                        })
                        
                        if(findUserData) {
                            let objID = findUserData._id.toString().trim()
                            console.log(objID);
                            reqBody.sender['senderId']=objID
                        }

                        const matchedBody = new transactionSchema(reqBody)
                        const saveData = await matchedBody.save()
                        saveData ? res.status(200).json({success:true,message:"Transaction saved"})
                        :
                        res.status(400).json({success:false,message: "Cant save data.(Both Id found)"})
                    }
                }
                else{
                    res.status(401).json({success:false,message:"Creator must match with sender or receiver"})
                }
            }
            catch(err){
                console.log(err);
                res.status(500).json({success:false, message:err.message})
            }
        },

        //get all transations
        async getAllTransactions(req,res){
            try{
                const pageLimit = PaginationConsts.PageLimit;
                let currentPage = 1
                if(req.params.currentPage){
                    currentPage = req.params.currentPage
                } 
                else{
                    currentPage = 1
                }
                const getAllPage = await transactionSchema.find({})

                const allData = await transactionSchema.find({}).limit(pageLimit).skip((currentPage-1)*pageLimit).populate("type createdBy sender.senderId receiver.receiverId")
                allData.length>0 ? res.status(200).json({success:true,message:"Transactions fetching done.",totalPage:Math.ceil(getAllPage.length/pageLimit) , data:allData})
                :
                res.status(401).json({success:false, message:"Data can't fetch"})
            }
            catch(err){
                res.status(500).json({success:false, message:err.message})
            }
        },

        //get all transactions created by this user
        async getAllCreatedTransactionOfUser(req,res){
            try{
                const pageLimit = PaginationConsts.PageLimit;
                let currentPage = 1
                if(req.params.currentPage){
                    currentPage = req.params.currentPage
                } 
                else{
                    currentPage = 1
                }
                
                const getAllPage = await transactionSchema.find({})
                const allData = await transactionSchema.find({createdBy: req.createdBy}).limit(pageLimit).skip((currentPage-1)*pageLimit).populate("type createdBy sender.senderId receiver.receiverId")
                
                allData.length>0 ? res.status(200).json({success:true,message:"All your created transaction found.",totalPage:Math.ceil(getAllPage.length/pageLimit), data:allData})
                :
                res.status(401).json({success:true,message:"No transaction was created by you"})
            }
            catch(err){
                res.status(500).json({success:false, message: err.message})
            }
        },

        //get all transaction related to a user
        async getAllTransactionsOfUser(req,res){
            try{
                const pageLimit = PaginationConsts.PageLimit;
                let currentPage = 1
                if(req.params.currentPage){
                    currentPage = req.params.currentPage
                } 
                else{
                    currentPage = 1
                }
                
              
                const getAllPage = await transactionSchema.find({
                    $or: [{
                        'sender.senderId': req.createdBy
                    }, {
                        'receiver.receiverId': req.createdBy
                    }]
                }) 

                const getData = await transactionSchema.find({
                    $or: [{
                        'sender.senderId': req.createdBy
                    }, {
                        'receiver.receiverId': req.createdBy
                    }]
                }).limit(pageLimit).skip((currentPage-1)*pageLimit)

                
                getData.length>0 ? res.status(200).json({success:true, message:"All users transactions found", totalPage:Math.ceil(getAllPage.length/pageLimit) ,data:getData})
                :
                res.status(200).json({success:false, message:"No data found",data:getData})
            }
            catch(err){
                res.status(500).json({success:false, message:err.message})
            }
        },

        //change transaction status
        async changeTransactionStatus(req,res){
            try{
                const createdBy = req.createdBy;
                if(req.body.senderStatus.trim()!=''){
                    const changeTransaction = await transactionSchema.findOneAndUpdate({_id:req.body.id},{senderStatus:req.body.senderStatus})
                }
                else{
                    const changeTransaction = await transactionSchema.findOneAndUpdate({_id:req.body.id},{receiverStatus:req.body.receiverStatus})
                    if(changeTransaction){
                        res.status(200).json({success:true,message:"Changed successful"})
                    }
                    else{
                        res.status(404).json({success:false,message:"Can't change"})
                    }
                }
            }
            catch(err){
                res.status(500).json({success:false,message:err.message})
            }
        },

        //transaction Summary
        async getTransactionSummaryOfTwoUser(req,res){
            try{
                const  otherUser=req.params.id
                const loggedUser =req.createdBy
                // const  loggedUser ='63e348b37aa315ce214439c4' 
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

        //get full summary of a user
        async getFullSummaryOfUser(req,res){
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
                
                getData.length>0 ?  res.status(200).json({success:true,message:"Summary fetch done",data:getData})
                :
                res.status(203).jsn({success:false,message:"No transaction of your"})
              }
              catch(err){
                console.log(err);
              }
        },

        //search transaction by user
        



        
    }
}

module.exports = transactionControllers