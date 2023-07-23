const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster1.p9ba0ek.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    const allTeacherData = client.db("frame-maker").collection("teachers");
    const allCourses = client.db("frame-maker").collection("classes");
    const cartCollection = client.db("frame-maker").collection("carts");
    const allUser = client.db("frame-maker").collection("users");

    // Add User to server
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const alreadyUser = await usersCollection.findOne(query);
      if (alreadyUser) {
        return res.send({
          message: "user is used",
        });
      }
      const result = await allUser.insertOne(user);
      res.send(result);
    });

    // Get ALl techer data
    app.get("/teachers", async (req, res) => {
      const cursor = allTeacherData.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // get all course data
    app.get("/courses", async (req, res) => {
      const cursor = allCourses.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //  cart functionality
    app.post("/carts", async (req, res) => {
      const item = req.body;
      console.log(item);
      const result = await cartCollection.insertOne(item);
      res.send(result);
    });

    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      // match email data
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    // delete single course
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("AirCNC Server is running..");
});

app.listen(port, () => {
  console.log(`AirCNC is running on port ${port}`);
});
