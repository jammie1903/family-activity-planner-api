import { AuthenticationError } from 'apollo-server'

export default function requireAuth(fn) {
  return (...args) => {
    if (!args[2].currentUser) {
      throw new AuthenticationError('You are not authenticated')
    }
    return fn(...args)
  }
}
