import mongoose from 'mongoose'
import moment from 'moment'

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  occurences: {
    type: [Date]
  },
  isTemplate: Boolean,
  repeatSchedule: {
    type: {
      unit: {
        type: String,
        required: true,
        enum: ['day', 'week', 'month', 'year']
      },
      amount: {
        type: Number,
        required: true,
        min: 1
      }
    }
  },
  participants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'familyMember'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category'
  }
})

eventSchema.virtual('participantIds').get(function () {
  return this.participants.map(p => p._id)
})


eventSchema.virtual('categoryId').get(function () {
  return this.category && this.category._id
})

eventSchema.methods.addOccurencesUntil = function(targetDate) {
  let updated = false
  if(!this.repeatSchedule || !this.repeatSchedule.unit || !this.repeatSchedule.amount) {
    return updated
  }
  let latestDate = this.occurences[this.occurences.length - 1]
  while(latestDate.getTime() < targetDate.getTime()) {
    latestDate = moment(latestDate).add(this.repeatSchedule.amount, this.repeatSchedule.unit).toDate()
    this.occurences.push(latestDate)
    updated = true
  }
  return updated
}

eventSchema.methods.occurenceAt = function(date) {
  if(this.occurences.indexOf(date) === -1) {
    throw new Error(`event ${this._id} does not occur at ${date}`)
  }
  return {
    id: this._id,
    name: this.name,
    duration: this.duration,
    occurence: date,
    isTemplate: !!this.isTemplate,
    repeatSchedule: this.repeatSchedule,
    participantIds: this.participantIds,
    categoryId: this.categoryId
  }
}

export default mongoose.model('event', eventSchema)
