import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_TOKEN } from '../constants'
import { AuthenticationError } from 'apollo-server'

export default {
  Query: {
    login: async (parent, { email, password }, { models: { userModel } }, info) => {
      const user = await userModel.findOne({ email }).exec()

      if (!user) {
        throw new AuthenticationError('Your email and password combination were not valid')
      }

      const matchPasswords = bcrypt.compareSync(password, user.password)

      if (!matchPasswords) {
        throw new AuthenticationError('Your email and password combination were not valid')
      }

      const token = jwt.sign({ 
        id: user.id,
        email: user.email
       }, JWT_TOKEN)

      return { token }
    }
  },
  Mutation: {
    createUser: async (parent, { email, password }, { models: { userModel } }, info) => {
      return await userModel.create({ email, password })
    }
  },
}
