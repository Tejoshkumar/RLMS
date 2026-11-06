import test from 'node:test'
import assert from 'node:assert/strict'
import {
  bookingHasEnded,
  completeEndedBookings,
} from '../services/bookingExpiry.js'

test('booking is complete at or after its end time', () => {
  const now = new Date(2026, 10, 6, 16, 0)

  assert.equal(
    bookingHasEnded({ bookingDate: '2026-11-06', endTime: '15:59' }, now),
    true
  )
  assert.equal(
    bookingHasEnded({ bookingDate: '2026-11-06', endTime: '16:00' }, now),
    true
  )
  assert.equal(
    bookingHasEnded({ bookingDate: '2026-11-06', endTime: '16:01' }, now),
    false
  )
  assert.equal(
    bookingHasEnded({ bookingDate: '2026-11-07', endTime: '09:00' }, now),
    false
  )
})

test('only ended active bookings are persisted as completed', async () => {
  const now = new Date(2026, 10, 6, 16, 0)
  const records = [
    { _id: 'ended', bookingDate: '2026-11-06', endTime: '15:59', status: 'active' },
    { _id: 'at-end', bookingDate: '2026-11-06', endTime: '16:00', status: 'active' },
    { _id: 'future', bookingDate: '2026-11-06', endTime: '16:01', status: 'active' },
    { _id: 'tomorrow', bookingDate: '2026-11-07', endTime: '09:00', status: 'active' },
  ]
  const bookingModel = {
    find() {
      return {
        select() {
          return this
        },
        lean: async () => records,
      }
    },
    async updateMany(filter, update) {
      let modifiedCount = 0
      for (const record of records) {
        if (filter._id.$in.includes(record._id) && record.status === filter.status) {
          record.status = update.$set.status
          modifiedCount += 1
        }
      }
      return { modifiedCount }
    },
  }

  const completedCount = await completeEndedBookings(bookingModel, now)

  assert.equal(completedCount, 2)
  assert.equal(records.find(({ _id }) => _id === 'ended').status, 'completed')
  assert.equal(records.find(({ _id }) => _id === 'at-end').status, 'completed')
  assert.equal(records.find(({ _id }) => _id === 'future').status, 'active')
  assert.equal(records.find(({ _id }) => _id === 'tomorrow').status, 'active')
})
