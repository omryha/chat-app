const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    // User join
    socket.emit('message', 'Welcome')
    socket.broadcast.emit('message', 'A new user has joined!')

    // User sends
    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter()

        if (filter.isProfane(msg)) {
            return callback('Bad words are not allowed!')
        }

        io.emit('message', msg)
        callback()
    })

    // User's location
    socket.on('sendLocation', (userLocation, callback) => {
        io.emit('locationMessage', `http://google.com/maps?q=${userLocation.lat},${userLocation.long}`)
        callback()
    })

    // User leave
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left!')
    })
})

server.listen(port, () => {
    console.log(`Server is up on ${port}`)
})