import { UserInputError } from 'apollo-server'
import requireAuth from '../helpers/requireAuth'

export default {
  Query: {
    events: requireAuth(async (parent, { categoryId, date }, { models: { eventModel, categoryModel }, currentUser }) => {
      if(!(await categoryModel.hasAccess(currentUser, categoryId))) {
        throw new UserInputError('A category with the given id could not be found')
      }

      const dayStart = new Date(date.getTime())
      dayStart.setHours(0,0,0,0)

      const dayEnd = new Date(date.getTime())
      dayEnd.setHours(23,59,59,999)

      let events = await eventModel.find({
        category: categoryId,
        occurences: { $elemMatch: { $gte: dayStart, $lt: dayEnd } }
      })

      const possibleEvents = await eventModel.find({
        category: categoryId,
        _id: { $not: { $in: events.map(e => e._id) } },
        repeatSchedule: { $ne: null },
        occurences: { $not : { $gte : dayStart }}
      })

      const updated = possibleEvents.filter(event => event.addOccurencesUntil(dayEnd))
      for(const u of updated) {
        await u.save()
      }

      const allEvents = [...events, ...possibleEvents]
      const instances = allEvents.flatMap(e => 
        e.occurences.filter(o => o.getTime() >= dayStart.getTime() && o.getTime() < dayEnd.getTime())
          .map(o => e.occurenceAt(o))
      )

      instances.sort((e1, e2) => e1.occurence - e2.occurence)
      return instances
    }),
    templateEvents: requireAuth(async (parent, { categoryId }, { models: { eventModel }, currentUser }) => {
      if(!(await categoryModel.hasAccess(currentUser, categoryId))) {
        throw new UserInputError('A category with the given id could not be found')
      }

      return eventModel.find({ categoryId, isTemplate: true }).exec()
    })
  },
  Mutation: {
    createEvent: requireAuth(async (parent, { event }, { models: { eventModel, categoryModel}, currentUser }) => {
      if(!(await categoryModel.hasAccess(currentUser, event.categoryId))) {
        throw new UserInputError('A category with the given id could not be found')
      }
   
      return (await eventModel.create({
        name: event.name,
        duration: event.duration,
        occurences: [event.occurence],
        isTemplate: event.isTemplate,
        repeatSchedule: event.repeatSchedule,
        participants: event.participantIds,
        category: event.categoryId
      })).occurenceAt(event.occurence)
    }),
    useTemplateEvent: requireAuth(async (parent, { templateId, occurence }, { models: { eventModel, categoryModel }, currentUser }) => {
      const template = await eventModel.findOne({_id: templateId, isTemplate: true }).exec()

      if(!template || !(await categoryModel.hasAccess(currentUser, template.category))) {
        throw new UserInputError('An event template with the given id could not be found')
      }

      if(template.occurences.find(o => o.getTime() === occurence.getTime())) {
        throw new UserInputError('The event already has an occurence at the given time')
      }

      template.occurences.push(occurence)
      template.occurences.sort()

      await template.save()

      return template.occurenceAt(occurence)
    }),
    updateEvent: requireAuth(async (parent, { editDateTime, editFutureItems, event: eventArgs }, { models: { eventModel, categoryModel } }) => {
      const event = await eventModel.findById(event.id).exec()

      if(!event || !(await categoryModel.hasAccess(currentUser, event.category))) {
        throw new UserInputError('An event with the given id could not be found')
      }

      const matchingTime = event.occurences.findIndex(dt => dt.getTime() === editDateTime.getTime())
      if(matchingTime === -1) {
        throw new UserInputError('The event does not have an occurence at the time specified')
      }

      //TODO perform update
      if(editFutureItems) {
        if(matchingTime === 0) {
          // update the entry in place, clear all durations and recalculate based upon supplied (optional) occurence and new (optional) duration
        } else {
          // clone the event, remove repeat schedule and any dates >= provided occurence from old instance
          // update the clone with the new values
          // return the clone
        }
      } else {
        if(matchingTime === event.occurences.length - 1) {
          // add a new occurence to the original 
        }
        // clone the event, remove the occurence from the original event
        // update the clone with the new values
        // return the clone
      }
    }),
    deleteEvent: requireAuth(async (parent, { deleteDateTime, deleteFutureItems, id }, { models: { eventModel } }) => {
      const event = await eventModel.findById(id).exec()

      if(!event || !(await categoryModel.hasAccess(currentUser, event.category))) {
        throw new UserInputError('An event with the given id could not be found')
      }

      const matchingTime = event.occurences.findIndex(dt => dt.getTime() === deleteDateTime.getTime())
      if(matchingTime === -1) {
        throw new UserInputError('The event does not have an occurence at the time specified')
      }

      //TODO
      if(deleteFutureItems) {
        if(matchingTime === 0) {
          // delete the entire event
        } else {
          // remove repeat schedule and any dates >= provided occurence from the event
          // save the event
        }
      } else {
        if(matchingTime === event.occurences.length - 1) {
          // add a new occurence to the event 
        }
        // remove the occurence from the event
        // save the event
      }
    })
  }
}
