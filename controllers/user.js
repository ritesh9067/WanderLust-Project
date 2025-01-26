const Listing =require("../models/listing");
const Review = require("../models/review");
const User = require("../models/user.js");

module.exports.renderSignupForm =(req,res)=>{
    res.render("users/signup.ejs");
  };

module.exports.signup =async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Create a new User instance
    const newUser = new User({ email, username });

    // Attempt to register the user
    const registeredUser = await User.register(newUser, password);

    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
      if(err){
        return next(err);
      }
      req.flash("success","Welcome to Wanderlust");
      res.redirect("/listings"); // Redirect to listings or another page after successful signup
    });
  } catch (err) {
    if (err.name === "UserExistsError") {
      console.log("Error: Username already exists.");
      res.status(400).send("A user with the given username is already registered. Please choose a different username.");
    } else {
      console.log(err);
      res.status(500).send("An unexpected error occurred. Please try again later.");
    }
  }
};

module.exports.renderLoginForm =(req,res)=>{
    res.render("users/login.ejs");
  };

module.exports.login =async (req, res) => {
    req.flash("success","you are logged in");// Debugging line
    res.redirect("/listings");
  };

module.exports.logout =(req,res)=>{
    req.logout((err)=>{
      if(err){
        return next(err);
      }
      req.flash("success","you are logged out");
      res.redirect("/listings");
    })
  };