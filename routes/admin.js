var express = require('express');
const { route } = require('./user');
var router = express.Router();
var productHelper=require('../helpers/product-helpers');
var categoryHelper=require("../helpers/category-add")
var userHelpers=require('../helpers/user-helpers')


router.get('/login', function(req, res, next) {
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
  if(req.session.loggedIn){
     res.redirect('/admin')
  }else{
    res.render('admin/admin-login',{loginerr:req.session.loginerr,layout:'login-layout'});
    req.session.loginerr=false
  }
})
/* GET users listing. */
router.get('/', function(req, res, next) { 
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
   productHelper.getAllProducts().then((products)=>{
    
    if (req.session.adminLoggedIn){
      
    res.render('admin/view-products',{products,admin:true})}
    else{res.render('admin/admin-login', { adminLoggErr: req.session.adminLoggErr,layout:'login-layout' });
    req.session.adminLoggErr = false;}
    
   }) }),   
  
  
  router.get('/add-project',function(req,res) {
 
      if (req.session.adminLoggedIn) {
        let errmess = req.session.errmess
    

    res.render("admin/add-project",{admin:true})
  }}),

  router.post('/add-project',(req,res)=>{

   productHelper.addProject(req.body,(id)=>{
    let image=req.files.image
    
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.redirect("/admin/add-project",)
      }
      else{
        console.log(err)
      }
    })
    
   })
  });
  
  router.get('/add-allProject',function(req,res) {
 
    if (req.session.adminLoggedIn) {
      let errmess = req.session.errmess
  

  res.render("admin/addAllProject",{admin:true})
}}),

router.post('/add-allProject',(req,res)=>{

 productHelper.addAllProject(req.body,(id)=>{
  let image=req.files.image
  
  image.mv('./public/allProject/'+id+'.jpg',(err,done)=>{
    if(!err){
      res.redirect("/admin/add-allproject",)
    }
    else{
      console.log(err)
    }
  })
  
 })
});

router.get('/viewAllproject', function(req, res, next) { 
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
   productHelper.getAllProjects().then((project)=>{
    
    if (req.session.adminLoggedIn){
      
    res.render('admin/viewAllProjects',{project,admin:true})}

    else{res.render('admin/admin-login',
     { adminLoggErr: req.session.adminLoggErr,layout:'login-layout' });
    req.session.adminLoggErr = false;}
    
   }) })  
  


const admindb = {
  email: "manu@gmail.com",
  password: 1305
}

router.post('/adminLogin', function (req, res) {
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
  if (req.body.email == admindb.email && req.body.password == admindb.password) {
    req.session.adminLoggedIn = true;
    res.redirect('/admin');
  } else {
    req.session.adminLoggErr = true;
    res.redirect('login');
  }
});

router.get('/delete-product/:id',(req,res)=>{
let proId=req.params.id
console.log(proId);
productHelper.deleteProduct(proId).then((respone)=>{
  res.redirect('/admin')
})
})
router.get('/edit-product',async(req,res)=>{
  
  let proId=req.query.id
  let category=categoryHelper.viewCategory()
 productHelper.getProductDetails(proId).then((product)=>{
  
  res.render('admin/edit-product',{category,product,admin:true})
  
})
  
})
router.post('/edit-product/:id',(req,res)=>{

  
   productHelper.updateProduct(req.params.id,req.body).then((response)=>{
    res.redirect("/admin")
   })
  })
 ;





router.get('/adminLoggout', function (req, res, next) {
  req.session.destroy();
  res.redirect('login');
});

router.get('/add-banner',function(req,res) {
 
    if (req.session.adminLoggedIn) {
      
  res.render("admin/add-banner",{admin:true})
}}),





router.post('/add-banner',(req,res)=>{

 productHelper.addBanner(req.body,(id)=>{
  let bimage=req.files.image
  
  bimage.mv('./public/bimages/'+id+'.jpg',(err,done)=>{
    if(!err){
      res.redirect("/admin/viewBanners",)
    }
    else{
      console.log(err)
    }
  })
  
 })
});


router.get('/viewBanners', function(req, res, next) { 
  
   productHelper.getAllBanner().then((banner)=>{
    
    if (req.session.adminLoggedIn){
      
    res.render('admin/viewBanners',{banner,admin:true})}


    else{res.render('admin/admin-login', { adminLoggErr: req.session.adminLoggErr,layout:'login-layout' });
    req.session.adminLoggErr = false;}
    
   }) }),   
  

   router.get('/deleteBanner/:id',(req,res)=>{
    let bannerId=req.params.id
   
    productHelper.deleteBanner(bannerId).then((respone)=>{
      res.redirect('/admin/viewBanners')
    })
    })


     
     router.get('/dashboard',async(req,res)=>{
      
      
      res.render('admin/dashboard',{admin:true})
       
     })
    






     router.get('/orderDetails',function(req, res, next) {
  
      // let user=req.session.user
     
      let proId=req.query.id
      productHelper.getOrderDetails(proId).then((order)=>{
       
        res.render('admin/orderDetails',{order,admin:true});
       })})
    

router.get("/addSatisfiedcustomers", async (req, res) => {
        
        if (req.session.adminLoggedIn) {
          
           
            res.render("admin/addSatisfiedcustomers", {
             admin:true,
              
            });
          ;
        }  else{res.render('admin/admin-login', { adminLoggErr: req.session.adminLoggErr,layout:'login-layout' });
        req.session.adminLoggErr = false;}
      })



      
      router.get("/satisfiedcustomers", async (req, res) => {
        
        if (req.session.adminLoggedIn) {
          
           
            res.render("admin/satisfiedcustomers", {
             admin:true,
              
            });
          ;
        }  else{res.render('admin/admin-login', { adminLoggErr: req.session.adminLoggErr,layout:'login-layout' });
        req.session.adminLoggErr = false;}

      })

      router.post('/addSatisfaction',(req,res)=>{

        productHelper.addSatisfaction(req.body,(id)=>{
         let image=req.files.image
         
         image.mv('./public/satisfiedCustomers/'+id+'.jpg',(err,done)=>{
           if(!err){
             res.redirect("/admin/satisfiedcustomers",)
           }
           else{
             console.log(err)
           }
         })
         
        })
       });
       
       router.get('/viewSatifiedcustomers', function(req, res, next) { 
        res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
         productHelper.getAllcustomers().then((customers)=>{
          
          if (req.session.adminLoggedIn){
            
          res.render('admin/viewSatifiedcustomers',{customers,admin:true})}
          else{res.render('admin/admin-login', { adminLoggErr: req.session.adminLoggErr,layout:'login-layout' });
          req.session.adminLoggErr = false;}
          
         }) }), 
      
         router.get('/facts',(req,res)=>{
          res.render('admin/facts',{facts})
         })
          
        
        
      

module.exports = router;
