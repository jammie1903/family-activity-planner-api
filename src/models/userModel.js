import bcrypt from 'bcrypt'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: email => email && /[^@]+@[^\.]+\..+/.test(email),
      message: props => `${props.value} is not a valid email address`
    },
  },
  password: {
    type: String,
    required: true
  }
})

function onSave () {
  const hashedPassword = bcrypt.hashSync(this.password, 12)
  this.password = hashedPassword
}

userSchema.pre('save', onSave)

export default mongoose.model('user', userSchema)
