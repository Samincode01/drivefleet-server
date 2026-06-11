const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://drivefleet:tnAG7CASiwZP7g6j@cluster0.coyimpf.mongodb.net/?appName=Cluster0";
const app = express()
const PORT = 5000


app.get('/', (req,res)=>{
    res.send('Server is running fine')
})
app.listen(PORT, ()=>
{
    console.log(`Server is running on PORT:${PORT}`)
})