if(process.env.NODE_ENV!="production"){
  require('dotenv').config();
}


const express = require("express");
const app = express();

const mongoose = require("mongoose");
const Listing = require("./models/listing");
const methodOverride = require("method-override");//to override method post to put ,delete,patch
const ejsMate = require("ejs-mate");//we are using for templating
const ExpressError = require("./utils/ExpressError.js");

const Review =require("./models/review.js");

//requiring session
const session  =require("express-session");
const MongoStore = require("connect-mongo");

//requiring passport
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//package for flash messages
const flash = require("connect-flash");

//requiring controller
const listingController = require("./controllers/listings.js");
const reviewController = require("./controllers/review.js");
const userController = require("./controllers/user.js");


//cloudinary setup
const {storage} = require("./cloudConfig.js");

//multer package for form
const multer = require("multer");
const upload = multer({storage});











//for setting up the ejs file
const path = require("path");
const passport = require("passport");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({"extended":true}));//to parse incoming data to request we are using this
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

//const dburl = process.env.ATLASDB_URL;


  //connecting to database
  async function main() {
    await mongoose.connect(MONGO_URL);
  }

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });


  const wrapAsync = (fn) => {
    return function (req, res, next) {
      fn(req, res, next).catch(next);
    };
  };


  const store =MongoStore.create({
    mongoUrl:MONGO_URL,
    crypto:{
      secret:process.env.SECRETE,
    },
    touchAfter: 24*3600,
  });


  store.on("error" ,()=>{
    console.log("Error in Mongo session store",err);
  });


  const sessionOptions ={
    store,
    secret : process.env.SECRETE,
    resave : false,
    saveUninitialized: true,
    cookie: {
      expires : Date.now() + 7 * 24 *60 *1000,
      maxAge : 7 * 24 *60 *1000,
    },
  };


  app.use(session(sessionOptions));

   //middleware for passport
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy(User.authenticate()));

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  app.use(flash());

  app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.currentUser = req.user; // Setting the current user
    next();
  });
  

  // app.get("/demouser",async(req,res)=>{
  //   let fakeUser = new User({
  //     email :"student@gmail.com",
  //     username:"delta-student"
  //   });
  //  let registeredUser =await User.register(fakeUser,"helloworld");// we are taking fakeuser and password as argument
  //  res.send(registeredUser);
  // });

// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

//search route
app.get("/search",async(req,res,next)=>{
  try{
    const location =req.query.location;

  if(!location){
    req.flash("error","Please provide a location to search.");
    return res.redirect("/listings");
  }
  const listings =await Listing.find({location:new RegExp(location,"i")});
  if(listings.length==0){
    req.flash("error",`No listings found for location:${location}`);
    return res.redirect("/listings");
  }
  
  res.render("listings/index.ejs",{allListings:listings});
}
  catch(err){
    next(err);
  }
});



//router for login the user
app.get("/login",userController.renderLoginForm);

app.post("/login", passport.authenticate("local", { failureRedirect: '/login' }), userController.login);



//router for hangling logout of user
app.get("/logout",userController.logout);


//router for signing up user
app.get("/signup",userController.renderSignupForm);

//router for handling signup form
app.post("/signup", userController.signup);








// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });



//starting our server
app.listen(3000,  (req,res) => {
   console.log("listening to port 3000");
});


//creating index route
app.get("/listings",listingController.index);


//new route is used to create new listing
app.get("/listings/new",listingController.renderNewForm);

//create route to handel form submission
app.post("/listings",upload.single('listing[image]'),listingController.createListing  );

//show route we are using to print data of indivisual listing
app.get("/listings/:id",listingController.showListing);  

//edit and update route
// get -> /listings/:id/edit -> edit form->submit ->put /listing/:id
app.get("/listings/:id/edit",listingController.renderEditForm);

//update route
app.put("/listings/:id",upload.single('listing[image]'),listingController.updateListing);

//Delete route
// handling request /listings/:id
app.delete("/listings/:id",listingController.destroyListing);


//following i am using for handling reviews
//post route
app.post("/listings/:id/reviews",reviewController.createReview);

 //delete route for reviews
 app.delete("/listings/:id/reviews/:reviewId",reviewController.deleteReview);






//following i am using for handling error

app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"page Not found!"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err; // Default values
  res.status(statusCode).send(message); // Send a proper HTTP status code and message
});



app.get("/demoUser",async(req,res)=>{
  let fakeUser = new User({
    email: "student@gmail.com",
    username :"delta-student",
  });
  let registerUser =await User.register(fakeUser, "helloworld");
  res.send(registerUser);
});

//functionality for search 






