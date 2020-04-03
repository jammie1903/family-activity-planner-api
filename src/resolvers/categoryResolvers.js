import { UserInputError, ValidationError } from 'apollo-server'
import { MAX_CATEGORIES } from '../constants'
import requireAuth from '../helpers/requireAuth'

export default {
  Mutation: {
    createCategory: requireAuth(async (parent, { name, plannerId }, { models: { categoryModel, plannerModel }, currentUser }) => {
      const planner = await plannerModel.findById(plannerId)

      if(!planner || !(await planner.hasAccess(currentUser))) {
        throw new UserInputError('A planner with the given id could not be found')
      }

      const categoryNames = (await categoryModel.find({planner: planner._id}, 'name').exec()).map(c => c.name)

      if(categoryNames.length >= MAX_CATEGORIES) {
        throw new ValidationError(`A planner cannot have more than ${MAX_CATEGORIES} categories`)
      }

      if(categoryNames.indexOf(name) !== -1) {
        throw new ValidationError('A category with the given name already exists')
      }

      return categoryModel.create({
        name,
        planner: planner._id,
      })
    }),
    updateCategory: requireAuth(async (parent, { id, name }, { models: { categoryModel }, currentUser }) => {
      const category = await categoryModel.findById(id).exec()

      if(!category || !(await category.hasAccess(currentUser))) {
        throw new UserInputError('A category with the given id could not be found')
      }
      
      const otherCategoryName = (await categoryModel.find({planner: category.planner, _id: {$ne: category._id}}).exec()).map(c => c.name)

      if(otherCategoryName.indexOf(name) !== -1) {
        throw new ValidationError('A category with the given name already exists')
      }

      await category.update({ name })
      return category
    }),
    deleteCategory: requireAuth(async (parent, { id }, { models: { categoryModel, eventModel }, currentUser }) => {
      const category = await categoryModel.findById(id).exec()

      if(!category || !(await category.hasAccess(currentUser))) {
        throw new UserInputError('A category with the given id could not be found')
      }

      await category.delete()
      await eventModel.deleteMany({category: category._id})
      return {id: category._id}
    })
  }
}
