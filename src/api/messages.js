import service from '../http'
import { USE_MOCK, mockResponse, mockMessages } from '../mock'

const url = {
  messages: '/messages/',
  messagesReceived: '/messages/received/',
  deleteAllRead: '/messages/received/delete_all_read/',
  readAllMessage: '/messages/received/read_all/',
  messagesSent: '/messages/sent/',
  deleteAllSent: '/messages/sent/delete_all'
}

const clone = (data) => JSON.parse(JSON.stringify(data))

export const receivedMessagesFromResponse = (response) => {
  const data = response && Object.prototype.hasOwnProperty.call(response, 'data')
    ? response.data
    : response
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.results)) return data.results
  if (data && Array.isArray(data.messages)) return data.messages
  return []
}

export const unreadReceivedCountFromResponse = (response) => {
  return receivedMessagesFromResponse(response).filter((message) => !message.is_read).length
}

export class Messages {
  static async createMessage(_data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.messages, { method: 'post', data: _data })
  }

  static async getAllReceivedMessages() {
    if (USE_MOCK) {
      return mockResponse(clone(mockMessages.received))
    }
    return service(url.messagesReceived, { method: 'get' })
  }

  static async getUnreadReceivedCount() {
    const response = await Messages.getAllReceivedMessages()
    return unreadReceivedCountFromResponse(response)
  }

  static async getReceivedMessageById(_id) {
    if (USE_MOCK) {
      const msg = mockMessages.received.find((m) => m.id === _id) || null
      return mockResponse(clone(msg))
    }
    return service(url.messagesReceived + _id + '/', { method: 'get' })
  }

  static async updateReceivedMessage(_id, _data) {
    if (USE_MOCK) {
      const msg = mockMessages.received.find((m) => m.id === _id)
      if (msg) Object.assign(msg, _data)
      return mockResponse(clone(msg || { ok: true }))
    }
    return service(url.messagesReceived + _id + '/', { method: 'put', data: _data })
  }

  static async setMessageReadById(_id, _data) {
    if (USE_MOCK) {
      const msg = mockMessages.received.find((m) => m.id === _id)
      if (msg) msg.is_read = _data && Object.prototype.hasOwnProperty.call(_data, 'is_read') ? _data.is_read : true
      return mockResponse(clone(msg || { ok: true }))
    }
    return service(url.messagesReceived + _id + '/', { method: 'patch', data: _data })
  }

  static async deleteMessageById(_id) {
    if (USE_MOCK) {
      const index = mockMessages.received.findIndex((m) => m.id === _id)
      if (index !== -1) mockMessages.received.splice(index, 1)
      return mockResponse({ ok: true })
    }
    return service(url.messagesReceived + _id + '/', { method: 'delete' })
  }

  static async deleteAllReadMessages() {
    if (USE_MOCK) {
      for (let i = mockMessages.received.length - 1; i >= 0; i -= 1) {
        if (mockMessages.received[i].is_read) mockMessages.received.splice(i, 1)
      }
      return mockResponse({ ok: true })
    }
    return service(url.deleteAllRead, { method: 'delete' })
  }

  static async setAllMessageRead() {
    if (USE_MOCK) {
      mockMessages.received.forEach((m) => { m.is_read = true })
      return mockResponse({ ok: true })
    }
    return service(url.readAllMessage, { method: 'patch' })
  }

  static async getAllSentMessages() {
    if (USE_MOCK) {
      return mockResponse(clone(mockMessages.sent))
    }
    return service(url.messagesSent, { method: 'get' })
  }

  static async getSentMessageById(_id) {
    if (USE_MOCK) {
      const msg = mockMessages.sent.find((m) => m.id === _id) || null
      return mockResponse(clone(msg))
    }
    return service(url.messagesSent + _id + '/', { method: 'get' })
  }

  static async deleteSentMessage(_id) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.messagesSent + _id + '/', { method: 'delete' })
  }

  static async deleteAllSentMessage() {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.deleteAllSent, { method: 'delete' })
  }
}
