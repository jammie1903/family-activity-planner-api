import userSchema from './userSchema'
import categorySchema from './categorySchema'
import eventSchema from './eventSchema'
import familyMemberSchema from './familyMemberSchema'
import plannerSchema from './plannerSchema'
import { gql } from 'apollo-server'

const linkSchema = gql`

  scalar Date
  scalar DateTime
  scalar Time

  type DeletedItem {
    id: ID!
  }

  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
`

export default [ 
  linkSchema, 
  userSchema, 
  categorySchema,
  eventSchema,
  familyMemberSchema,
  plannerSchema
]
