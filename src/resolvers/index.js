import userResolvers from './userResolvers'
import categoryResolvers from './categoryResolvers'
import eventResolvers from './eventResolvers'
import familyMemberResolvers from './familyMemberResolvers'
import plannerResolvers from './plannerResolvers'

import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date'

const scalarResolvers = {
  Date: GraphQLDate,
  Time: GraphQLTime,
  DateTime: GraphQLDateTime
}

export default [
  scalarResolvers, 
  userResolvers, 
  categoryResolvers,
  eventResolvers,
  familyMemberResolvers,
  plannerResolvers
]
