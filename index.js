const express = require('express')
const app = express()
const cors = require('cors')
const client = require('./db')
const ObjectId= require('mongodb').ObjectId
const serverSocket = require('http').createServer(app)
const {Server} = require('socket.io')
const io = new Server(serverSocket, {
    cors: {
        origin : "*",
        methods: ["GET", "POST"]
    }
})
app.use(express.json())
app.use(cors())

io.on('connection', socket=>{

    console.log('user :', socket.id)
    socket.on('join', (roomId)=>{

        socket.join(roomId)
        console.log(`user ${socket.id} has join the room : ${roomId} `)

    })
    socket.on('send', async(messageObject) =>{
        console.log(messageObject)
        socket.to(messageObject.roomId).emit('receive_message', messageObject)
        await client.connect()
       const newMessage = await client.db('chat_test').collection('room').updateOne(
            {_id : new ObjectId(messageObject.roomId) }, {$addToSet : { messages : { 
                author : messageObject.author,
                content : messageObject.content,
                time : messageObject.time
            }}}
        )
        console.log(newMessage)
        
    })
    socket.on('disconnect', ()=>{
        console.log('user disconnected : ', socket.id)
    })
})
 
app.post('/registerUser', async (req, res)=>{

    console.log('it made it here')
    const userName = req.body.userName
    const email = req.body.email
    await client.connect()
    const newUser = await client.db('chat_test').collection('users').insertOne(
        {
            name : userName,
            email
        },
        (error, result)=>{
            if(error) return res.send(error)
            console.log('this is the result',result)
            return res.send(result)
        }
    )
    
    
})
app.get('/getUsers', async (req, res)=>{
    await client.connect()
    const users = await client.db('chat_test').collection('users').find({}).toArray()
  
    res.send(users)
})
app.post('/createRoom', async (req, res)=>{
    const participantsArray = req.body.participants
    await client.connect()
    const createRoom = await client.db('chat_test').collection('room').insertOne(
        {
            participants : participantsArray,
            messages : []
        },
        (error,result)=>{
            if(error) return res.send(error)
            res.send(result)
        }
    )
})
app.get('/getAllRooms', async(req, res)=>{
    await client.connect()
    const getAllRooms = await client.db('chat_test').collection('room').find({}).toArray()
    res.send(getAllRooms)
})
app.get('/getSingleRoom/:roomId', async(req, res)=>{
    const roomId =  new ObjectId(req.params.roomId)
    await client.connect()
    const getRoom = await client.db('chat_test').collection('room').findOne(
        {_id : roomId}
    )
    res.send(getRoom)

})
serverSocket.listen(5005, ()=>{
    console.log(' socket connection running on port 5005')
}) 
 app.listen(5006, ()=>{
    console.log('app running on port 5006')
}) 