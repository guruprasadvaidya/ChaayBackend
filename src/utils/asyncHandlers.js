// wrapper function with the promises
const asyncHandler = (requestHandler) => {
 return   (req, res, next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next (err))
    }
}



export default asyncHandler


// this is a wrapper function, which is reusable and made with try and catch(can also be done with promises .then and catch mentioned above)
// const asyncHandler = (fn) => async (req,res,next) => {
// try{
// await fn(req,res,next)
// }catch (error) {
// res.status(err.code || 500).json({
//     success:false,
//     message:err.message
// } )
// }}
