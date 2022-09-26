
const { MongoClient } = require("mongodb");

const uri = 'mongodb+srv://alfonso:peTTTmCH2RGBS2jk@cluster0.fpefy.mongodb.net/test?maxPoolSize=15&retryWrites=true&w=majority'

const client = new MongoClient(uri)


module.exports=client