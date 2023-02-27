//import all route to here (for redirecting)
const testRoute = require('./testRoute/testRoute')
const userRoute = require('./userRoute/userRoute')
const authRoute = require('./authRoute/authRoute')
const emailRoute = require('../routes/emailRoute/emailRoute')
const transactionRoute = require('./transactionRoute/transactionRoute')
const errorControllers = require('../app/controllers/errorControllers')

//all routes gateway
function initRoutes(app){
    /* Redirecting all test related request  to `testRoute` */
    app.use('/api/test', testRoute)

    /* Redirecting all user related request  to `userRoute` */
    app.use('/api/user', userRoute)

    app.use('/api/auth', authRoute)

    app.use('/api/transaction', transactionRoute)

    app.use('/api/email',emailRoute)


    
    /*
    error 404 not found 
    Redirecting all undefined route request to  `errorNotFound` function. 
    */
    app.use("*", errorControllers().errorNotFound)
}
module.exports  =  initRoutes;