const { response } = require("express");
var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");
var otpVarification = require("../helpers/otp-validation");
var categoryHelpers = require("../helpers/category-add");

/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  console.log(user);
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
    let baner = productHelper.getAllBanner();
  }

  productHelper.getAllProducts().then((products) => {
    productHelper.getAllBanner().then((banner) => {
      productHelper.getAllcustomers().then((customers)=>{

      
      res.render("user/homepage", { products, user,customers, banner });
    })
    });
  });
});
router.get("/project",  function (req, res) {
 
  
  res.render("user/projects",);
  
});

router.get("/about",  function (req, res) {
 
  
  res.render("user/about");
  
});

    router.get("/service", (req, res) => {
    
        res.render("user/service");
     
    }),
    router.get("/contact", (req, res) => {
    
      res.render("user/contact");
   
  }),
  

module.exports = router;
