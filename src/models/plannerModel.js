import mongoose from 'mongoose'

const plannerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  startHour: {
    type: Number,
    required: true
  },
  endHour: {
    type: Number,
    required: true
  },
})

plannerSchema.statics.hasAccess = function(user, plannerId) {
  return this.model('familyMember').hasMemberInPlanner(user, plannerId)
}

plannerSchema.methods.hasAccess = function(user) {
  return this.model('familyMember').hasMemberInPlanner(user, this)
}

export default mongoose.model('planner', plannerSchema)
