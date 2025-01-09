import { Server } from 'socket.io'
import http from 'http'
import express from 'express'

// Create express app and http server
const app = express()
const server = http.createServer(app)

// Initialize socket.io server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// Export all necessary components
export { io, server, app } 