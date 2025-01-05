// builts a method and export 

const asyncHandler = (requestHandler)=>{
    (req ,res , next)=>{
        Promise.resolve(requestHandler(req , res, next)).catch((err) => next(err))
    }
}


export {asyncHandler}
// higher order function acting as a wrapper accepting a function and passing it as a param to other 
// const asyncHandler = (fn)=> async (req, res, next) =>  {
// try {
//     await fn(req , res , next)
// } catch (error) {
//     res.status(error.code || 500).json({
//         successful : false,
//         message : error.message
//     })

    
// }
// }

