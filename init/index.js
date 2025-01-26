const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Connecting to the database
async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

// Initializing the database
const initDB = async () => {
  try {
    // Deleting all listings
    await Listing.deleteMany({});
    console.log("Deleted all listings");

    //setting same owner to all list
   const updatedData = initData.data.map((obj)=>({
      ...obj,owner:'678958efc7125c995407bdb8'
    }));

    // Inserting data
    await Listing.insertMany(updatedData);
    console.log("Inserted data");
  } catch (err) {
    console.error("Error during database initialization:", err);
  }
};

initDB();
