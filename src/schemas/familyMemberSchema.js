import { gql } from 'apollo-server'

export default gql`
  type FamilyMember {
    id: ID!
    name: String!
    color: String!
    userEmail: String
    plannerId: ID!
  }

  input FamilyMemberUpdate {
    id: ID!
    name: String
    color: String
    userEmail: String
  }

  extend type Mutation {
    createFamilyMember(name: String!, plannerId: ID!, userEmail: String): FamilyMember!
    updateFamilyMember(values: FamilyMemberUpdate!): FamilyMember!
    deleteFamilyMember(id: ID!): DeletedItem!
  }
`
