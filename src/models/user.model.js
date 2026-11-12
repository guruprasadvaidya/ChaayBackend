import mongoose, {Schema} from 'mongoose';

import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
 {

    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim:true,
        index:true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim:true,
      
    },
    fullname:{
        type: String,
        required: true,
        index:true,
        trim:true,
      
    },
    avatar:{
        type: String, // cloudinary url where you upload media and it gives URl 
        required: true,
       
      
    },
    coverImage: {
        type: String
        
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password: {
        type: String,
        required: [true,"password is required"]
    },
    refreshToken: {
        type: String

    },
    
        timestamps: true
    

})

// dont use arrow function here as .this dont use with it, so using normal function , as it takes time so will add async
userSchema.pre( "save", async function (next) {
    if(!this.isModified("password")) return next ();
    this.password = await bcrypt.hash(this.password,10)
    next()
} ) 

userSchema.methods.isPasswordCorrect = async function (password) {
  return await  bcrypt.compare(password, this.password)
//   if its matchable so will give true and if not then return false
}

// these both are JWT tokens
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
          _id: this._id,
          username: this.username,
          email: this.email,
          fullname: this.fullname
       },
       process.env.ACCESS_TOKEN_SECRET,
       {
         expiresIn: process.env.ACCESS_TOEKN_EXPIRY
       }
            )
}
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
          _id: this._id,
          username: this.username,

       },
       process.env.REFRESH_TOKEN_SECRET,
       {
         expiresIn: process.env.REFRESH_TOEKN_EXPIRY
       }
            )
}

export const User = mongoose.model("User", userSchema)