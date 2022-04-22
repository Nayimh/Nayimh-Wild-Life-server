const express = require('express');

const app = express();
const cors = require('cors');

const ObjectId = require('mongodb').ObjectId;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const cli = require('nodemon/lib/cli');

const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cetyr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const database = client.db('wildLife');

        const packageCollection = database.collection('package');
        const reviewCollection = database.collection('reviews');
        const bookingCollection = database.collection('booking');
        const userCollection = database.collection('users');

        // package section
        // get packages
        app.get("/package", async (req, res) => {
            const cursor = packageCollection.find({});
            const package = await cursor.toArray();
            res.send(package);
        })

        //delete 
        app.delete("/package/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deletePackage = await packageCollection.deleteOne(query);
            res.send(deletePackage);
        })

        // get by id
        app.get("/package/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const package = await packageCollection.findOne(query);
            res.send(package);
        });

        // post 
        app.post("/package", async (req, res) => {
            const package = await packageCollection.insertOne(req.body);
            res.send(package);
        })

        //review section
        app.get("/reviews", async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        })

        // post review
        app.post("/reviews", async (req, res) => {
            const review = await reviewCollection.insertOne(req.body);
            res.json(review);
        })

        //booking section
        //post 
        app.post("/booking", async (req, res) => {
            const booking = await bookingCollection.insertOne(req.body);
            res.json(booking);
        })

        //get 
        app.get("/booking", async (req, res) => {
            const cursor = bookingCollection.find({});
            const result = cursor.toArray();
            res.json(result);
        })

        //get by email
        app.get("/booking/:email", async (req, res) => {
            const email = req.params.email;
            const cursor = bookingCollection.find({});
            const bookings = await cursor.toArray();
            const userBooking = bookings.filter((mail) => mail.email === email);
            res.json(userBooking);
        })

        //get by id
        app.get("/booking/:id", async (req, res) => {
            const query = { _id: ObjectId(req.params.id) };
            const booking = await bookingCollection.findOne(query);
            req.json(booking);
        })

        //delete
        app.delete("/booking/:id", async (req, res) => {
            const query = { _id: ObjectId(req.params.id) };
            const deletebooking = await bookingCollection.deleteOne(query);
            res.send(deletebooking);
        })

        //user section
        //post 
        app.post("/users", async (req, res) => {
            const user = await userCollection.insertOne(req.body);
            res.json(user);
        });

        //upsert user
        app.put("/users", async (req, res) => {
            const user = req.body;
            const filter = {email : user.email };
            const option = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, option);
            res.json(result);
        });

        // make admin
        app.put("/users/admin", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        //admin filter
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        


    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running');
});

app.listen(port, () => {
    console.log('listning to port', port);
})