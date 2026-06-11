const express = require("express");
const dotenv = require("dotenv");
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
} = require("mongodb");

const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

const client = new MongoClient(
  process.env.MONGODB_URI,
  {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  }
);

async function run() {
  try {
    await client.connect();

    const db = client.db("drivefleet");
    const carCollection =
      db.collection("cars");

    // Get all cars
   app.get("/cars", async (req, res) => {
  const { type, search } = req.query;

  let query = {};

  if (type) {
    query.carType = type;
  }

  if (search) {
    query.carName = {
      $regex: search,
      $options: "i",
    };
  }

  const result = await carCollection
    .find(query)
    .toArray();

  res.send(result);
});

    // Get single car
    app.get(
      "/cars/:id",
      async (req, res) => {
        const id = req.params.id;

        const result =
          await carCollection.findOne({
            _id: new ObjectId(id),
          });

        res.send(result);
      }
    );

    // Add car
    app.post("/cars", async (req, res) => {
      const carData = req.body;

      const result =
        await carCollection.insertOne(
          carData
        );

      res.send(result);
    });

    // My added cars
    app.get(
      "/my-added-cars/:email",
      async (req, res) => {
        const email = req.params.email;

        const result =
          await carCollection
            .find({
              ownerEmail: email,
            })
            .toArray();

        res.send(result);
      }
    );

    // Update car
    app.patch(
      "/cars/:id",
      async (req, res) => {
        const id = req.params.id;

        const updatedCar =
          req.body;

        const result =
          await carCollection.updateOne(
            {
              _id: new ObjectId(id),
            },
            {
              $set: updatedCar,
            }
          );

        res.send(result);
      }
    );

    // Delete car
    app.delete(
      "/cars/:id",
      async (req, res) => {
        const id = req.params.id;

        const result =
          await carCollection.deleteOne({
            _id: new ObjectId(id),
          });

        res.send(result);
      }
    );

    await client
      .db("admin")
      .command({ ping: 1 });

    console.log(
      "MongoDB Connected Successfully"
    );
  } catch (error) {
    console.log(error);
  }
}

run();

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});