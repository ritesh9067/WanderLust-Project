const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review =require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename:String,
  },
  price: Number,
  location: String,
  country: String,
  reviews : [
    {
    type: Schema.Types.ObjectId,
    ref: "Review",
    },
  ],
  owner:{
    type: Schema.Types.ObjectId,
    ref:"User",
  },
  geometry:{
    type:{
      type:String,
      enum:['Point'],
      required:true
    },
    coordinates:{
      type:[Number],
      required:true,
    },
  },
});

//creating post mongoose middleware
//when we delete listing the review associated with it not get deleted so that's why  i am using this middleware for that
listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({reviews:{id: listing.review}});
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
