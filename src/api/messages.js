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

export class Messages {
  static async createMessage(_data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.messages, { method: 'post', data: _data })
  }

  static async getAllReceivedMessages() {
    if (USE_MOCK) {
      return mockResponse(JSON.parse(JSON.stringify(mockMessages.received)))
    }
    return service(url.messagesReceived, { method: 'get' })
  }

  static async getReceivedMessageById(_id) {
    if (USE_MOCK) {
      const msg = mockMessages.received.find((m) => m.id === _id) || null
      return mockResponse(msg)
    }
    return service(url.messagesReceived + _id + '/', { method: 'get' })
  }

  static async updateReceivedMessage(_id, _data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.messagesReceived + _id + '/', { method: 'put', data: _data })
  }

  static async setMessageReadById(_id, _data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.messagesReceived + _id + '/', { method: 'patch', data: _data })
  }

  static async deleteMessageById(_id) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.messagesReceived + _id + '/', { method: 'delete' })
  }

  static async deleteAllReadMessages() {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.deleteAllRead, { method: 'delete' })
  }

  static async setAllMessageRead() {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.readAllMessage, { method: 'patch' })
  }

  static async getAllSentMessages() {
    if (USE_MOCK) {
      return mockResponse(JSON.parse(JSON.stringify(mockMessages.sent)))
    }
    return service(url.messagesSent, { method: 'get' })
  }

  static async getSentMessageById(_id) {
    if (USE_MOCK) {
      const msg = mockMessages.sent.find((m) => m.id === _id) || null
      return mockResponse(msg)
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
