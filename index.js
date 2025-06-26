const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nqjhfm8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const usersCollection = client.db("roommatesFinderDB").collection("users");
    const roomsCollection = client.db("roommatesFinderDB").collection("listingsRooms");

    // Users API
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const userProfile = req.body;
      const result = await usersCollection.insertOne(userProfile);
      res.send(result);
    });

    app.get('/users/email/:email', async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email });
      if (user) {
        res.send(user);
      } else {
        res.status(404).send({ message: "User not found" });
      }
    });

    // Rooms API
    app.get("/listingsRooms", async (req, res) => {
      const result = await roomsCollection.find().toArray();
      res.send(result);
    });

    app.get("/listingsRooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result);
    });

    app.post("/listingsRooms", async (req, res) => {
      const addRoom = {
        ...req.body,
        views: 0,
        likes: 0,
        createdAt: new Date().toISOString(),
      };
      const result = await roomsCollection.insertOne(addRoom);
      res.send(result);
    });

    app.put("/listingsRooms/:id", async (req, res) => {
      const { amenities } = req.body
      console.log(Array.isArray(amenities));

      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateListingRoom = req.body;
      const updateDoc = {
        $set: {
          ...updateListingRoom,
          updatedAt: new Date().toISOString(),
        },
      };
      const result = await roomsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/listingsRooms/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateListingRoom = req.body;
      const updateDoc = {
        $set: {
          ...updateListingRoom,
          updatedAt: new Date().toISOString(),
        },
      };
      const result = await roomsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/listingsRooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.deleteOne(query);
      res.send(result);
    });

    // View count API
    app.post("/listingsRooms/views/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $inc: { views: 0 },
      };
      const result = await roomsCollection.updateOne(filter, updateDoc);
      const updatedRoom = await roomsCollection.findOne(filter);
      res.send({ views: updatedRoom.views });
    });

    // Like count API
    app.get("/listingsRooms/likes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const room = await roomsCollection.findOne(query);
      res.send({ likes: room.likes || 0 });
    });

    app.post("/listingsRooms/likes/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $inc: { likes: 1 },
      };
      const result = await roomsCollection.updateOne(filter, updateDoc);
      const updatedRoom = await roomsCollection.findOne(filter);
      res.send({ likes: updatedRoom.likes });
    });

    //8 limit & availability API 
    app.get("/featuredRooms", async (req, res) => {
      const query = { availability: "Available" };
      const result = await roomsCollection.find(query).limit(8).toArray();
      res.send(result);
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Roommates Finder Server is running");
});

app.listen(port, () => {
  console.log(`Roommates Finder Server running on port ${port}`);
});