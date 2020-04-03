import { gql } from 'apollo-server'

export default gql`
  type User {
    email: String!
  }

  type Token {
    token: String!
  }

  extend type Query {
    login(email: String!, password: String!): Token!
  }

  extend type Mutation {
    createUser(email: String!, password: String!): User!
  }
`
