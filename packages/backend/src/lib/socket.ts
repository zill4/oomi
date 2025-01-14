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
    
    io = new Server(server, {
      cors: {
        origin: ['http://localhost:3000', 'http://frontend'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true
    })
  }
  return { io, server, app }
}

const { io: initializedIo, server: initializedServer, app: initializedApp } = initialize()

export { initializedIo as io, initializedServer as server, initializedApp as app } 