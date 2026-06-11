const express = require('express')
const dotenv = require('dotenv')
const { MongoClient, ServerApiVersion } = require('mongodb');
dotenv.config()
const uri = process.env.MONGODB_URI;
const app = express()
const PORT = process.env.PORT;
const cors = require("cors");

app.use(cors());

app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    
    await client.connect();
    const db = client.db("drivefleet")
    const carCollection = db.collection("cars")
    app.get('/cars', async(req,res)=>{
    const result = await carCollection.find().toArray()
    res.json(result)

})
app.get("/cars/:id", async (req, res) => {
  const id = req.params.id;

  const result = await carCollection.findOne({
    _id: id,
  });

  res.send(result);
});
    app.post('/cars', async (req,res)=>{
    const carsData = req.body
    console.log(carsData)
    const result = await carCollection.insertOne(carsData)
    res.json(result)
})

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req,res)=>{
    res.send('Server is running fine')
})
app.listen(PORT, ()=>
{
    console.log(`Server is running on PORT:${PORT}`)
})