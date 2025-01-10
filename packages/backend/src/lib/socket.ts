import { Server } from 'socket.io'
import http from 'http'
import express from 'express'

let io: Server
let app: express.Application
let server: http.Server

const initialize = () => {
  if (!app) {
    app = express()
    server = http.createServer(app)
    
    // Define origins array first to handle type checking
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter((origin): origin is string => !!origin) // Type predicate to ensure string[]
    
    io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
      }
    })
  }
  return { io, server, app }
}

// Initialize on import
const { io: initializedIo, server: initializedServer, app: initializedApp } = initialize()

export { initializedIo as io, initializedServer as server, initializedApp as app } 