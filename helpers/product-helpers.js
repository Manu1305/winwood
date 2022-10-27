
var db=  require('../config/connection')
var collection=require('../config/collection')
const collections = require('../config/collection')
const { ObjectID } = require('bson')
const userHelpers = require('./user-helpers')
var ObjectId=require('mongodb').ObjectId
module.exports={

    addProject:(product,callback)=>{
        
        db.get().collection('project').insertOne(product).then((data)=>{
            callback(data.insertedId)
        
        })
        
    },
    addAllProject:(project,callback)=>{
        db.get().collection('allProject').insertOne(project).then((data)=>{
            callback(data.insertedId)
    }
    )},
    addSatisfaction:(customers,callback)=>{
        db.get().collection('satisfaction').insertOne(customers).then((data)=>{
            callback(data.insertedId)
    }
    )},
    getAllcustomers:()=>{
        return new Promise(async(resolve,reject)=>{
           let customers=await db.get().collection(collections.CUSTOMER_SATISFACTION).find().toArray()
          
           resolve(customers)
           
        })
    },

    getAllProjects:()=>{
        return new Promise(async(resolve,reject)=>{
           let project=await db.get().collection(collections.ALL_PROJECTS).find().toArray()
           console.log('checkproject'+project);
           resolve(project)
           
        })
    },

    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
           let products=await db.get().collection(collections.PROJECT_COLLECTIONS).find().toArray()
           resolve(products)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PROJECT_COLLECTIONS).deleteOne({_id:ObjectId(proId)}).then((response)=>{
                  resolve(response)
            })
        })
    }, 
    // deleteCategory:(catId)=>{
    //     return new Promise ((resolve,reject)=>{
    //        db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:ObjectId(catId)}).then((response)=>{
    //         resolve(response)
    //        })
    //     })
    // } ,


    getProductDetails:(proId)=>{
        console.log(ObjectId(proId))
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PROJECT_COLLECTIONS).findOne({_id:ObjectId(proId)}).then((product)=>{
                resolve(product)
            })
        })

    },
updateProduct:(proId,proDetails)=>{
    console.log(proId,proDetails);
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PROJECT_COLLECTIONS).updateOne({_id:ObjectId(proId)},{
          $set:{
            Name:proDetails.Name,
            description:proDetails.description,
            price:proDetails.price
            
          }  
        }).then((response)=>{
           resolve(response) 
        })
        
    })
},
addBanner:(banner,callback)=>{
        
    db.get().collection('banner').insertOne(banner).then((data)=>{
        callback(data.insertedId)
    
    })



},
getAllBanner:()=>{
    return new Promise(async(resolve,reject)=>{
       let banner=await db.get().collection(collections.BANNER_COLLECTIONS).find().toArray()
       resolve(banner)
    })
},

deleteBanner:(bannerId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.BANNER_COLLECTIONS).deleteOne({_id:ObjectId(bannerId)}).then((response)=>{
              resolve(response)
        })
    })
}
,


getAllOrders:()=>{
    return new Promise(async(resolve,reject)=>{
        let userdetails=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
        resolve(userdetails)
    })
},


updateOrder:(proId,proDetails)=>{
    console.log(proId,proDetails);
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(proId)},{
          $set:{
            status:proDetails.status,
            
            
          }  
        }).then((response)=>{
           resolve(response) 
        })
        
    })
},


getOrderDetails:(proId)=>{
    
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(proId)}).then((order)=>{
            resolve(order)
        })
    })

}
,
viewCoupon:()=>{
    return new Promise(async (resolve, reject) => {
        let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
        resolve(coupon)
    })
},

addCoupon: (coupon) => {
    return new Promise(async (resolve, reject) => {
        coupon.user=[]
        coupon.discount=parseInt(coupon.discount)
            db.get().collection(collection.COUPON_COLLECTION).insertOne({coupon}).then(() => {
                resolve()
            })
        
    })
}, 

deleteCoupon:(catId)=>{
    return new Promise ((resolve,reject)=>{
       db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:ObjectId(catId)}).then((response)=>{
        resolve(response)
       })
    })
},

applyCoupon:(coupon,userId)=>{
    return new Promise(async(resolve,reject)=>{
        console.log(coupon);
        let response={};
        response.discount=0;
        let couponData=await db.get().collection(collection.COUPON_COLLECTION).findOne({'coupon.coupon':coupon.coupon})
        console.log("coupon Data:  "+couponData);
        if(couponData){
            let userExit= await db.get().collection(collection.COUPON_COLLECTION).findOne({'coupon.coupon':coupon.coupon,user:{
                $in:[ObjectID(userId)]
                
            }})
            if(userExit){
                response.status=false;
                console.log('exxxxx');
                resolve(response)
            }
            else{
                response.status=true;
                response.coupon=couponData.coupon;
                userHelpers.getTotalAmount(userId).then((total)=>{
                    console.log("total:   "+total);
                    response.discountTotal=total-(total*couponData.coupon.discount/100)
                    response.discountPrice=(total*couponData.coupon.discount)/100
                    resolve(response)
                    console.log(response);
                })
            }
        }else{
            response.status=false;
            console.log('hhhhhhhhhh');
            resolve(response)
        }
    })
}



}