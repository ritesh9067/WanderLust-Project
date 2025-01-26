const Listing =require("../models/listing");
const Review = require("../models/review");

module.exports.createReview =async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author =req.user._id;
    console.log(newReview);
   
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    
    req.flash("success","New Review Created!");
    res.redirect(`/listings/${listing.id}`);
   
   };

module.exports.deleteReview =async(req,res)=>{
    if(!req.isAuthenticated()){
      req.flash("error", "You must be logged in to access this page.");
     return res.redirect("/login");
    }
  
    let {id, reviewId} = req.params
    const review = await Review.findById(reviewId);
    //checking if logged in user is author of review
    if(!review.author.equals(req.user._id)){
      req.flash("error","You do not have Permission to delete this review");
      return res.redirect(`/listings/${id}`);
    }
  
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
   await Review.findByIdAndDelete(reviewId);
  
   req.flash("success","New Review Deleted!"); 
  
   res.redirect(`/listings/${id}`);
   };