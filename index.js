const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({
      error: true,
      message: "accees token unAuthirize",
    });
  }
  // bearer token
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        error: true,
        message: "accees token unAuthirize",
      });
    }
    req.decoded = decoded;
    next();
  });
};

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
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (user?.role !== "admin") {
        return res.status(403).send({ error: true, message: "access deniyed" });
      }
      next();
    };
    // app.post for jwt
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET_TOKEN, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // all user and filter
    app.get("/users", async (req, res) => {
      const result = await allUser.find().toArray();
      res.send(result);
    });

    // Update user role
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "teacher",
        },
      };
      const result = await allUser.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Add User to server
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const alreadyUser = await allUser.findOne(query);
      if (alreadyUser) {
        return res.send({
          message: "user is used",
        });
      }
      const result = await allUser.insertOne(user);
      res.send(result);
    });

    app.get("/users/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;

      if (req.decoded.email !== email) {
        res.send({ admin: false });
      }

      const query = { email: email };
      const user = await userCollection.findOne(query);
      const result = {
        admin: user?.role === "admin",
      };
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

    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/carts", async (req, res) => {
      const item = req.body;
      console.log(item);
      const result = await cartCollection.insertOne(item);
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
  res.send(" Server is running..");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
