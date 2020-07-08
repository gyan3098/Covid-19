const mongoose = require("mongoose");
const validator = require("validator")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Patient = require('./patient')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true

    },
    
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid")
            }
        }
    },
    
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error("Password cannot contain password")
            }
        }
    },
    
    
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
    
},{
    timestamps: true  
})

userSchema.virtual('patient' , {
    ref: 'Patient',
    localField: '_id',
    foreignField: 'owner'
})


userSchema.methods.getPublicProfile = function() {
    const profile = this
    const userObject = profile.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function() {
    const profile = this
    const token = jwt.sign({ _id: profile._id.toString() }, 'covid19',  {expiresIn: '30 minute'})

    profile.tokens = profile.tokens.concat({ token })
    await profile.save()
    return token
}

userSchema.methods.decoder = async function(token) {
    const decoded = jwt.verify(token, 'covid19')
    const user = await Profile.findOne({ _id: decoded._id , 'tokens.token' : token})
    if(!user) {
        throw new Error()
    }
    req.user = user
    console.log(token)

}

userSchema.statics.findByCredentials = async (email,password) => {
    const user =  await Profile.findOne({email});
    console.log(user)
    if(!user){
        throw new Error('User not found')
        // console.log("User not found")
    }

    const isMatch = await bcrypt.compare(password,user.password)
    //isMatch = true;
    if(!isMatch){
        throw new Error('Incorrect Password')
        //console.log("Incorrect password")
    }
    return user
}

// userSchema.pre('save',async function(next) {
//     const profile = this

//     if(profile.isModified('passwords')){
//         profile.password = await bcrypt.hash(profile.password,8)
//     }
//     next()
// })

// userSchema.pre( 'remove' ,async function (next) {
//     const user = this
//     await Image.deleteMany({ owner: user._id}) 
//     next()
// })
const Profile = mongoose.model('profile',userSchema)

module.exports = Profile