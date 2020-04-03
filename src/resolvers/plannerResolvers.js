import { UserInputError } from 'apollo-server'
import requireAuth from '../helpers/requireAuth'

export default {
  Query: {
    planners: requireAuth(async (parent, args, { models: { plannerModel, familyMemberModel }, currentUser }, info) => {
      const plannerIds = (await familyMemberModel.find({userEmail: currentUser.email}, 'planner')).map(p => p.planner)

      return plannerModel.find({ _id: {$in: plannerIds }}).exec()
    }),
    planner: requireAuth(async (parent, {id}, { models: { plannerModel, familyMemberModel }, currentUser }, info) => {
      if(!(await plannerModel.hasAccess(currentUser, id))) {
        throw new UserInputError('A planner with the given id could not be found')
      }

      return plannerModel.findById(id).exec()
    })
  },
  Mutation: {
    createPlanner: requireAuth(async (parent, { name, familyMemberName }, { models: { familyMemberModel, plannerModel, categoryModel }, currentUser }, info) => {
      const planner = await plannerModel.create({
        name,
        startHour: 7,
        endHour: 21
      })
      
      await familyMemberModel.create({
        name: familyMemberName,
        color: familyMemberModel.randomColor(),
        userEmail: currentUser.email,
        planner: planner._id,
      })

      await categoryModel.create(
        {
          name: 'Activities',
          planner: planner._id,
        },
        {
          name: 'Food',
          planner: planner._id,
        }
      )

      return planner
    }),
    deletePlanner: requireAuth(async (parent, { id }, { models: { familyMemberModel, plannerModel, categoryModel, eventModel }, currentUser }, info) => {
      if(!(await plannerModel.hasAccess(currentUser, id))) {
        throw new UserInputError('A planner with the given id could not be found')
      }
      await plannerModel.deleteOne({_id: id})
      await familyMemberModel.deleteMany({planner: id}).exec()

      const categories = await categoryModel.find({planner: id}).exec()
      for(let category of categories) {
        await category.delete()
        await eventModel.deleteMany({category: category._id})
      }
      return { id }
    })
  },
  Planner: {
    members: async (parent, args, { models: { familyMemberModel } }, info) => {
      return familyMemberModel.find({planner: parent._id}).exec()
    },
    categories: (parent, args, { models: { categoryModel } }, info) => {
      return categoryModel.find({planner: parent._id}).exec()
    }
  }
}
