import { gql } from 'apollo-server'

export default gql`
  type Event {
    id: ID!
    name: String!
    duration: Int!
    occurence: DateTime!
    isTemplate: Boolean
    repeatSchedule: RepeatSchedule
    participantIds: [ID!]!
    categoryId: ID!
  }

  type TemplateEvent {
    id: ID!
    name: String!
    duration: Int!
    occurences: [DateTime!]!
    participantIds: [ID!]!
    categoryId: ID!
  }

  input EventInput {
    name: String!
    duration: Int!
    occurence: DateTime!
    isTemplate: Boolean
    repeatSchedule: RepeatScheduleInput
    participantIds: [ID!]!
    categoryId: ID!
  }

  input UpdateEventInput {
    id: ID!
    name: String
    duration: Int
    occurence: DateTime
    isTemplate: Boolean
    repeatSchedule: RepeatScheduleInput
    participantIds: [ID!]
  }

  type RepeatSchedule {
    unit: String!
    amount: Int!
  }

  input RepeatScheduleInput {
    unit: String!
    amount: Int!
  }

  extend type Query {
    events(categoryId: ID!, date: Date): [Event!]!
    templateEvents(categoryId: ID!): [TemplateEvent!]!
  }

  extend type Mutation {
    createEvent(event: EventInput!): Event!
    useTemplateEvent(templateId: ID!, occurence: DateTime!): Event!
    updateEvent(event: UpdateEventInput!, editDateTime: DateTime!, editFutureItems: Boolean!): Event!
    deleteEvent(id: ID!, deleteDateTime: DateTime!, deleteFutureItems: Boolean): DeletedItem!
  }
`
