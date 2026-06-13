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

// Collections
const db = client.db("drivefleet");

const carCollection =
  db.collection("cars");

const bookingCollection =
  db.collection("bookings");

// MongoDB Connection
async function run() {
  try {
    await client.connect();

    console.log(
      "MongoDB Connected Successfully"
    );
  } catch (error) {
    console.log(error);
  }
}

run();

// Root Route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Test Route
app.get("/test", (req, res) => {
  res.send("test works");
});

// Get All Cars
app.get("/cars", async (req, res) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).send({
        message: "Unauthorized",
      });
    }

    const { type, search } =
      req.query;

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

    const result =
      await carCollection
        .find(query)
        .toArray();

    res.send(result);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Server Error",
    });
  }
});

// Get Single Car
app.get(
  "/cars/:id",
  async (req, res) => {
    try {
      const id =
        req.params.id;

      const result =
        await carCollection.findOne({
          _id: id,
        });

      res.send(result);
    } catch (error) {
      console.log(error);

      res.status(500).send({
        message:
          "Server Error",
      });
    }
  }
);

// Add Car
app.post("/cars", async (req, res) => {
  try {
    const carData = {
      _id: new ObjectId().toString(),
      ...req.body,
      bookingCount: 0,
    };

    const result =
      await carCollection.insertOne(
        carData
      );

    res.send(result);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Server Error",
    });
  }
});

// My Added Cars
app.get(
  "/my-added-cars/:email",
  async (req, res) => {
    try {
      const email =
        req.params.email;

      const result =
        await carCollection
          .find({
            ownerEmail:
              email,
          })
          .toArray();

      res.send(result);
    } catch (error) {
      console.log(error);

      res.status(500).send({
        message:
          "Server Error",
      });
    }
  }
);

// Update Car
app.patch(
  "/cars/:id",
  async (req, res) => {
    try {
      const id =
        req.params.id;

      const updatedCar =
        req.body;

      const result =
        await carCollection.updateOne(
          {
            _id: id,
          },
          {
            $set:
              updatedCar,
          }
        );

      res.send(result);
    } catch (error) {
      console.log(error);

      res.status(500).send({
        message:
          "Server Error",
      });
    }
  }
);

// Delete Car
app.delete(
  "/cars/:id",
  async (req, res) => {
    try {
      const id =
        req.params.id;

      const result =
        await carCollection.deleteOne(
          {
            _id: id,
          }
        );

      res.send(result);
    } catch (error) {
      console.log(error);

      res.status(500).send({
        message:
          "Server Error",
      });
    }
  }
);

// Book Car
app.post(
  "/bookings",
  async (req, res) => {
    try {
      const bookingData =
        req.body;

      const bookingResult =
        await bookingCollection.insertOne(
          bookingData
        );

      await carCollection.updateOne(
        {
          _id:
            bookingData.carId,
        },
        {
          $inc: {
            bookingCount: 1,
          },
        }
      );

      res.send(
        bookingResult
      );
    } catch (error) {
      console.log(error);

      res.status(500).send({
        message:
          "Server Error",
      });
    }
  }
);

// All Bookings
app.get(
  "/all-bookings",
  async (req, res) => {
    try {
      const result =
        await bookingCollection
          .find()
          .toArray();

      res.send(result);
    } catch (error) {
      console.log(error);

      res.status(500).send({
        message:
          "Server Error",
      });
    }
  }
);

// User Bookings
app.get(
  "/bookings/:email",
  async (req, res) => {
    try {
      const email =
        req.params.email;

      const result =
        await bookingCollection
          .find({
            userEmail:
              email,
          })
          .toArray();

      res.send(result);
    } catch (error) {
      console.log(error);

      res.status(500).send({
        message:
          "Server Error",
      });
    }
  }
);

// Delete Booking
app.delete(
  "/bookings/:id",
  async (req, res) => {
    try {
      const id =
        req.params.id;

      const booking =
        await bookingCollection.findOne(
          {
            _id:
              new ObjectId(
                id
              ),
          }
        );

      if (!booking) {
        return res.send({
          deletedCount: 0,
        });
      }

      const result =
        await bookingCollection.deleteOne(
          {
            _id:
              new ObjectId(
                id
              ),
          }
        );

      await carCollection.updateOne(
        {
          _id:
            booking.carId,
        },
        {
          $inc: {
            bookingCount:
              -1,
          },
        }
      );

      res.send(result);
    } catch (error) {
      console.log(error);

      res.status(500).send({
        message:
          "Server Error",
      });
    }
  }
);

module.exports = app;