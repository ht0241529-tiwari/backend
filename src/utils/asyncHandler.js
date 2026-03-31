const asyncHandler = (requestHandler) => {
    // Ye function ek aur function return karta hai
    return (req, res, next) => {
        // Promise.resolve aapke function ko chalata hai
        // Agar error aaya toh .catch usko pakad ke 'next' middleware ko de deta hai
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err));
    }
}
export { asyncHandler }


// const asyncHandler=()=>{}
// const asyncHandler=(fn)=>()=>{}
// const asyncHandler=(fn)=>async ()=>{}

// const asyncHandler=(fn)=>async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message || "Internal Server Error"
//         })
//     }
// }
//higher order function is a function that takes another function as an argument and returns a new function 
// example asyncHandler is a higher order function that takes a function as an argument and returns
//  a new function that handles the error and response of the original function

//funcion call back ka pass execute nahi hota hai
//promises in js