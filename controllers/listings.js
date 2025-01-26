const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken =process.env.MAP_TOKEN;
const geocodingClient =mbxGeocoding({accessToken:mapToken});

module.exports.index = async(req,res)=>{
    const allListings =await Listing.find({});
    res.render("listings/index",{allListings});
};

module.exports.renderNewForm =(req,res)=>{
    if(!req.isAuthenticated()){
      req.flash("error", "You must be logged in to access this page.");
     return res.redirect("/login");
    }
    res.render("listings/new.ejs");
  };

  module.exports.showListing =async(req,res)=>{
    let {id} =req.params;
    const listing =await Listing.findById(id)
    .populate({
      path:"reviews",
      populate:{
        path:"author",
      },
    })
    .populate("owner");
    console.log(listing.owner);

    res.render("listings/show.ejs",{listing});
};

module.exports.createListing =async(req,res)=>{
   let response = await geocodingClient
   .forwardGeocode({
    query: req.body.listing.location,
    limit: 1
  })
    .send()

    try{
      let url =req.file.path;
      let filename = req.file.filename;
      const newlisting =  new Listing(req.body.listing);
      newlisting.owner =req.user._id;
      newlisting.image ={url,filename};
      newlisting.geometry =response.body.features[0].geometry;
      let savedListing =await newlisting.save();
      console.log(savedListing);
      req.flash("success","New Listing Created!");
      res.redirect("/listings");
  
    }
    catch(err){
      next(err);
    }
  };

module.exports.renderEditForm =async(req,res)=>{
    if(!req.isAuthenticated()){
      req.flash("error", "You must be logged in to access this page.");
     return res.redirect("/login");
    }
    let {id} =req.params;
    const listing =await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
  };

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    let listing =await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file!== "undefined"){
      let url =req.file.path;
      let filename = req.file.filename;
      listing.image ={url,filename};
      await listing.save();
    }
    req.flash("success","Listing Updated !")
    res.redirect("/listings");
  };

module.exports.destroyListing =async(req,res)=>{
    let {id} = req.params;
    let deletedListing =await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","listing Deleted!");
    res.redirect("/listings");
  
  };