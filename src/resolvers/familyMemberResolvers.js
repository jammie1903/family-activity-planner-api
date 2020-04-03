import { UserInputError, ValidationError } from 'apollo-server'
import requireAuth from '../helpers/requireAuth'

export default {
  Mutation: {
    createFamilyMember: requireAuth(async (parent, { name, plannerId, userEmail }, { models: { familyMemberModel }, currentUser }) => {
      const existingMembers = await familyMemberModel.find({planner: plannerId}).exec()
      
      if(!existingMembers.find(m => m.userEmail === currentUser.email)) {
        throw new UserInputError('A planner with the given id could not be found')
      }

      if(existingMembers.find(m => m.name === name)) {
        throw new ValidationError('A family member with the given name already exists')
      }
      
      if(existingMembers.find(m => m.userEmail === userEmail.toLowerCase())) {
        throw new ValidationError('A family member with the given email address already exists')
      }
      
      return familyMemberModel.create({
        name,
        color: familyMemberModel.randomColor(),
        userEmail,
        planner: plannerId,
      })
    }),
    updateFamilyMember: requireAuth(async (parent, { values }, { models: { familyMemberModel }, currentUser }) => {
      const familyMember = await familyMemberModel.findById(values.id).exec()
      if(!familyMember) {
        throw new UserInputError('A family member with the given id could not be found')
      }

      const otherFamilyMembers = await familyMemberModel.find({planner: familyMember.planner, _id: {$ne: familyMember._id}}).exec()
      if(familyMember.userEmail !== currentUser.email && !otherFamilyMembers.find(m => m.userEmail === currentUser.email)) {
        throw new UserInputError('A family member with the given id could not be found')
      }
      
      if(values.userEmail && otherFamilyMembers.find(m => m.userEmail === values.userEmail)) {
        throw new ValidationError('A family member with the given email address already exists')
      }

      if(values.name && otherFamilyMembers.find(m => m.name === values.name)) {
        throw new ValidationError('A family member with the given name already exists')
      }

      familyMember.name = values.name || familyMember.name
      familyMember.userEmail = values.userEmail || familyMember.userEmail
      familyMember.color = values.color || familyMember.color

      return familyMember.save()
    }),
    deleteFamilyMember: requireAuth(async (parent, { id }, { models: { familyMemberModel }, currentUser }) => {
      const familyMember = await familyMemberModel.findById(id).exec()

      if(!familyMember) {
        throw new UserInputError('A family member with the given id could not be found')
      }

      if(familyMember.userEmail !== currentUser.email) {
        const otherFamilyMembers = await familyMemberModel.find({planner: familyMember.planner, _id: {$ne: familyMember._id}}).exec()

        if(!otherFamilyMembers.find(m => m.userEmail === currentUser.email)) {
          throw new UserInputError('A family member with the given id could not be found')
        }
      }

      await familyMember.delete()
      return { id: familyMember._id }
    })
  }
}
