const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Book Is Downloading")
})






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zvd8xno.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();
        const userCollections = client.db("rw").collection("users");
        const fqaCollections = client.db("rw").collection("fqa");

        /********Create user*******/
        app.post("/users", async (req, res) => {
            const userDetails = req.body;
            const query = { email: userDetails.email };
            const existingUser = await userCollections.findOne(query);
            if (existingUser) {
                return res.send({ message: "User Already Exist" });
            }
            const result = await userCollections.insertOne(userDetails);
            res.send(result);
        })

        /******** FQA GET API*******/
        app.get("/fqa", async (req, res) => {
            const result = await fqaCollections.find().toArray();
            res.send(result);

        })

        /******** Users GET API*******/
        app.get("/allusers", async (req, res) => {
            const result = await userCollections.find().toArray();
            res.send(result);

        })

         /******** Single User GET API*******/
         app.get("/singleuser/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await userCollections.findOne(query);
            res.send(result);

        })


        app.patch('/users/update/:email', async (req, res) => {
            const email = req.params.email;
            const data = req.body;
            console.log(data,email);
            const filter = { email:email };
            const updateDoc = {
              $set: {
                otp: data.otp
              },
            };
            const result = await userCollections.updateOne(filter, updateDoc);
            res.send(result);
          })




        // Send a ping to confirm a successful connection
        client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})