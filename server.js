import bodyParser from 'body-parser';
import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';

const app = express();

const uri = "mongodb+srv://s4007133:admin@dba-cluster.ojvqeei.mongodb.net/?retryWrites=true&w=majority&appName=DBA-Cluster";
const client = new MongoClient(uri);

// Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (e) {
        console.error("Error connecting to MongoDB", e);
    }
}

const db = client.db("sample_airbnb");

connectToDatabase();
 
app.get("/random-listings", async (req, res) => {
    try {
        const pipeline = [
            {
                $sample: {
                    size: 20
                }
            },
            {
                $project: {
                    name: 1,
                    summary: 1,
                    price: 1,
                    "review_scores.review_scores_rating": 1
                }
            }
        ]

        // grab random properties
        const query = await db.collection("listingsAndReviews").aggregate(pipeline).toArray();

        res.json(query);
    } catch (e) {
        console.error("Error getting random listings (backend)", e);
    }
});

app.post("/search", async (req, res) => {
    try {
        const pipeline = [
            {
                $match: {
                    $expr: {
                        $eq: [{ $toLower: "$address.market" }, { $toLower: req.body.location } ]
                    },
                    ...(req.body.property != "Select a property type" && { property_type: req.body.property }),
                    ...(req.body.bedrooms != "Select the number of bedrooms" && { bedrooms: Number(req.body.bedrooms) })
                }
            }
        ]

        // console.log("location: ", req.body.location);
        // console.log("property type: ", req.body.property);
        // console.log("bedrooms: ", req.body.bedrooms);
        // console.log("pipeline: ", pipeline[0]["$match"]);

        const query = await db.collection("listingsAndReviews").aggregate(pipeline).toArray();

        res.json(query);
    } catch (e) {
        console.error("Error when searching (backend)", e);
    }
});

app.post("/book", async (req, res) => {
    try {
        // Change check-in and check-out from string to date
        const newBooking = await db.collection("bookings").insertOne({
            ...req.body,
            checkIn: new Date(req.body.checkIn),
            checkOut: new Date(req.body.checkOut),
        });

        // get list of bookings for specified property
        const bookingsList = await db.collection("listingsAndReviews").findOne(
            { _id: req.body.listingID },
            { projection: {
                _id: 0,
                bookings: 1
            }}
        );

        // if list of bookings empty (would contain an empty object), assign it to empty array
        const bookings = Array.isArray(bookingsList?.bookings) ? bookingsList.bookings : [];

        bookings.push({ bookingID: newBooking.insertedId });

        // push changes
        await db.collection("listingsAndReviews").updateOne(
            { _id: req.body.listingID },
            { $set: { bookings: bookings } }
        );

        res.json({ message: "Successfully booked!" });
    } catch (e) {
        console.error("Error making a booking (backend)", e);
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`\nServer is running on port ${PORT}`);
});