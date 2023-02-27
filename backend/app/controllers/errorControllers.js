function errorControllers(){
    return{
        
        /**
         * It returns a 404 error if the route is not found.
         */
        errorNotFound(req,res){
            console.log("No route was found");
            res.status(404).json({
                success: false,
                message: "No route was found"
            })
        }
    }
}
module.exports = errorControllers