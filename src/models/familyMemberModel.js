import mongoose from 'mongoose'

const familyMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  planner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'planner'
  }
})

familyMemberSchema.virtual('plannerId').get(function () {
  return this.planner && this.planner._id
})


familyMemberSchema.statics.hasMemberInPlanner = async function(user, planner) {
  const id = mongoose.Types.ObjectId(planner._id || planner)

  return (await this.where({userEmail: user.email, planner: id}).countDocuments()) > 0
}

familyMemberSchema.statics.randomColor = function() {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue}, 100%, 50%)`
}

export default mongoose.model('familyMember', familyMemberSchema)
