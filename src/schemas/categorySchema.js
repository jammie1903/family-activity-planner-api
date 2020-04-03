import { gql } from 'apollo-server'

export default gql`
  type Category {
    id: ID!
    name: String!
    plannerId: ID!
  }


  extend type Mutation {
    createCategory(name: String!, plannerId: ID!): Category!
    updateCategory(id: ID!, name: String!): Category!
    deleteCategory(id: ID!): DeletedItem!
  }
`
