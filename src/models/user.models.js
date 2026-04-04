// import mongoose,{Schema} from "mongoose";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

// // const userSchema=new mongoose.Schema({},{})one way without importing Schema
// const userSchema=new Schema(
//     {
//        username:{
//         type:String,
//         required:true,
//         unique:true,
//         lowercase:true,
//         trim:true,
//         index:true
//        },
//        email:{
//         type:String,
//         required:true,
//         unique:true,
//         lowercase:true,
//         trim:true
//        },
//        fullName:{
//         type:String,
//         required:true,
//         trim:true,
//         index:true
//        },
//        avatar:{
//         type:String,//cloudinary url
//         required:true
//        },
//        coverImage:{
//         type:String,//cloudinary url
//        },
//        watchHistry:[
//         {
//         type:Schema.Types.ObjectId,
//         ref:"Video"
//        }
//     ],
//     password:{
//         type:String,
//         required:[true,"Password is required"]
//     },
//     refreshToken:{
//         type:String
//     }
// }
// ,{
//     timestamps:true
// })//another way with importing Schema

// userSchema.pre("save", async function () {
//     /* ⚠️ WHY WE ARE NOT USING 'next' HERE:
//        1. Yeh ek 'async' function hai. Jab hum 'async/await' use karte hain, 
//           toh Mongoose automatically samajh jata hai ki usko Promise resolve 
//           hone ka wait karna hai.
//        2. Naye Mongoose versions mein, jab aap function ko 'async' banate ho, 
//           toh Mongoose 'next' callback function ko parameter mein pass hi nahi karta.
//        3. Agar hum yahan next() call karenge, toh app crash ho jayegi aur 
//           "TypeError: next is not a function" aayega. Isliye hum bas 'return' 
//           karke function se bahar aa jate hain.
//     */

//     if (!this.isModified("password")) {
//         return; // Agar password change nahi hua, toh yahin se wapas laut jao bina kuch kiye
//     }

//     // Agar password change hua hai (ya naya user ban raha hai), toh usko hash (encrypt) karo
//     this.password = await bcrypt.hash(this.password, 10);
// });

// userSchema.methods.isPasswordCorrect = async function(password){
//     return await bcrypt.compare(password,this.password)
// }

// userSchema.methods.generateAccessToken = function(){
//   return jwt.sign(
//         {
//             _id:this._id,
//             userName:this.userName,
//             email:this.email,
//             fullName:this.fullName,
//         },
//         process.env.ACCESS_TOKEN_SECRET,
//         {
//             expiresIn:process.env.ACCESS_TOKEN_EXPIRY
//         }
//     )
// }
// userSchema.methods.generateRefreshToken = function(){
//      return jwt.sign(
//         {
//             _id:this._id,
//         },
//         process.env.REFRESH_TOKEN_SECRET,
//         {
//             expiresIn:process.env.REFRESH_TOKEN_EXPIRY
//         }
//     )
// }
// export const User=mongoose.model("User",userSchema)
import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// const userSchema=new mongoose.Schema({},{})one way without importing Schema
const userSchema=new Schema(
    {
       username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
       },
       email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
       },
       fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
       },
       avatar:{
        type:String,//cloudinary url
        required:true
       },
       coverImage:{
        type:String,//cloudinary url
       },
       watchHistry:[
        {
        type:Schema.Types.ObjectId,
        ref:"Video"
       }
    ],
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    refreshToken:{
        type:String
    }
}
,{
    timestamps:true
})//another way with importing Schema

userSchema.pre("save", async function () {
    /* ⚠️ WHY WE ARE NOT USING 'next' HERE:
       1. Yeh ek 'async' function hai. Jab hum 'async/await' use karte hain, 
          toh Mongoose automatically samajh jata hai ki usko Promise resolve 
          hone ka wait karna hai.
       2. Naye Mongoose versions mein, jab aap function ko 'async' banate ho, 
          toh Mongoose 'next' callback function ko parameter mein pass hi nahi karta.
       3. Agar hum yahan next() call karenge, toh app crash ho jayegi aur 
          "TypeError: next is not a function" aayega. Isliye hum bas 'return' 
          karke function se bahar aa jate hain.
    */

    if (!this.isModified("password")) {
        return; // Agar password change nahi hua, toh yahin se wapas laut jao bina kuch kiye
    }

    // Agar password change hua hai (ya naya user ban raha hai), toh usko hash (encrypt) karo
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
        {
            _id:this._id,
            username:this.username, // FIXED: Capital 'N' ko hatakar small 'n' kar diya
            email:this.email,
            fullName:this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
     return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User=mongoose.model("User",userSchema)