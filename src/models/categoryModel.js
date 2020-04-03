import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  planner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'planner'
  }
})

categorySchema.virtual('plannerId').get(function () {
  return this.planner && this.planner._id
})

categorySchema.statics.hasAccess = async function(user, categoryId) {
  const category = await this.findById(categoryId).exec()
  return category.hasAccess(user)
}

categorySchema.methods.hasAccess = function(user) {
  return this.model('familyMember').hasMemberInPlanner(user, this.planner)
}

export default mongoose.model('category', categorySchema)
