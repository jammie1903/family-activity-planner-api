import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

import { JWT_TOKEN, MONGO_URL } from './constants'
import { ApolloServer, AuthenticationError } from 'apollo-server-express'

import schemas from './schemas'
import resolvers from './resolvers'
import * as models from './models'

const app = express()
app.use(cors())

const getUser = (req) => {
  const token = req.headers['authorization']

  if (token && token.toLowerCase().startsWith('bearer ')) {
    try {
      return jwt.verify(token.substring(7), JWT_TOKEN)
    } catch (e) {
      throw new AuthenticationError('Your session expired. Sign in again.')
    }
  }
}

const server = new ApolloServer({
  typeDefs: schemas,
  resolvers,
  context: ({ req }) => {
    if (req) {
      const currentUser = getUser(req)
      return { currentUser, models }
    }
  },
  playground: process.env.NODE_ENV !== 'production'
})

server.applyMiddleware({ app, path: '/graphql' })

const port = process.env.PORT || 5000

app.listen(port, async () => {
  try {
    await mongoose.connect(MONGO_URL, { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log(`Mongoose connected to url '${MONGO_URL}'`)
  } catch(e) {
    console.error(`Mongoose failed to connect to url '${MONGO_URL}'`, e)
  }
})
