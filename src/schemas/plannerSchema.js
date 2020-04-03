import { gql } from 'apollo-server'

export default gql`
  type Planner {
    id: ID!
    name: String!
    startHour: Int!
    endHour: Int!
    members: [FamilyMember!]!
    categories: [Category!]!
  }

  extend type Query {
    planner(id: ID!): Planner!
    planners: [Planner!]!
  }

  extend type Mutation {
    createPlanner(name: String!, familyMemberName: String!): Planner!
    deletePlanner(id: ID!): DeletedItem!
  }
`
