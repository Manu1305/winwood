var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { response } = require("express");
const objectId = require("mongodb").ObjectId;
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: "rzp_test_ihBpdFwBqcYYW9",
  key_secret: "Ki41CrclP8WvXri6gDsz7mWK",
});

module.exports = {
  doSignup: (userData) => {
    userData.isBlocked=false
    let respone={}
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          userData._id = data.insertedId;
          resolve(userData);
        });
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {

      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.Email });
      console.log(user);
      if (user) {
        if(!user.isBlocked){
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
          
            console.log("true login");
            response.user = user;
            response.status = true;
            resolve(response);
            
          } else {
            resolve({ status: false });
          }
        });
      }else {
        reject("you are blocked");
      }
      } else {
        resolve({ status: false });
      }
   
    });
  },
  addToCart: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item == proId
        );
        console.log(proExist);
        if (proExist != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(proId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();

      resolve(cartItems);
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: objectId(details.cart) },

            {
              $pull: { products: { item: objectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: objectId(details.cart),
              "products.item": objectId(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then((response) => {
            resolve(true);
          });
      }
    });
  },
  removeCartProduct: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: objectId(details.cart) },

          {
            $pull: { products: { item: objectId(details.product) } },
          }
        )
        .then((response) => {
          resolve(true);
        });
    });
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: ["$quantity", { $toInt: "$product.price" }],
                },
              },
            },
          },
        ])
        .toArray();

      if (total[0]) {
        resolve(total[0].total);
      } else {
        resolve("0");
      }
    });
  },
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let userdetails = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(userdetails);
    });
  },
  deleteUser: (usrId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .deleteOne({ _id: objectId(usrId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  placeOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      console.log("hhhh", order);
      let status = order["payment-method"] === "COD" ? "placed" : "pending";
      let orderObj = {
        
        deliveryDetails:{
          name:order.name,
          mobile: order.phone,
          address: order.address,
          email: order.email,
          pin:order.pincode
        }
        ,
        userId: objectId(order.userId),
        paymentMethod: order["payment-method"],
        totalAamount: total,
        products: products,
        status: status,
        date: new Date().toString(),
      };

      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          db.get()
            .collection(collection.CART_COLLECTION)
            .deleteOne({ user: objectId(order.userId) });

          resolve(response.insertedId);
        });
    });
  },
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
        console.log(cart);
      resolve(cart.products);
    });
  },
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: objectId(userId) })
        .toArray();
      resolve(orders);
    });
  },
  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        var hex = /[0-9A-Fa-f]{6}/g;
        orderId = hex.test(orderId) ? objectId(orderId) : orderId;
        let orderItems = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: { _id: orderId },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTIONS,
                localField: "item",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$product", 0] },
              },
            },
          ])
          .toArray();
        console.log(orderItems, "jiiiiiiiiiiiiiii");
        resolve(orderItems);
      } catch (err) {
        console.log(err, "ladjflkadjflsdjlf");
      }
    });
  },

  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100,
        currency: "INR",
        receipt: "" + orderId,
      };

      instance.orders.create(options, (err, order) => {
        if (err) {
          console.log(err);
        } else {
          resolve(order);
        }
      });
    });
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      // console.log('hmac0',details);
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "Ki41CrclP8WvXri6gDsz7mWK");
      //console.log('hmac',hmac);
      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      console.log("hmac2", hmac);
      console.log("hmac2", details["payment[razorpay_signature]"]);
      if (hmac == details["payment[razorpay_signature]"]) {
        console.log("payment done user-help");
        resolve();
      } else {
        console.log("failed user help");
        reject();
      }
    });
  },

  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "placed",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  addToWishlist: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
    };
    console.log("add function");
    return new Promise(async (resolve, reject) => {
      let userWishList = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: objectId(userId) });
      console.log("add wish promise");
      if (userWishList) {
        let proExist = userWishList.products.findIndex(
          (product) => product.item == proId
        );
        console.log(proExist);
        if (proExist == -1) {
          console.log(proId);
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((data) => {
              console.log(data);
              resolve(data);
            });
        } else {
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(proId) },
              {
                $pull: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let wishListObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.WISHLIST_COLLECTION)
          .insertOne(wishListObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },

  getWishListProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wishListItems = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();

      resolve(wishListItems);
    });
  },

  removeWishListProduct: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.WISHLIST_COLLECTION)
        .updateOne(
          { _id: objectId(details.wish) },

          {
            $pull: { products: { item: objectId(details.product) } },
          }
        )
        .then((response) => {
          resolve(true);
        });
    });
  },
  addAdrress: (address, userId, callback) => {
    console.log("work");
    address.userId = objectId(userId);
    console.log(address);
    db.get()
      .collection(collection.ADD_ADDRESS)
      .insertOne(address)
      .then((data) => {
        callback(data.insertedId);
      });
  },

  // ,   updateProfile:(profId,profile)=>{
  //     console.log(profId,profile);
  //     return new Promise((resolve,reject)=>{
  //         db.get().collection(collection.ADD_PROFILE).updateOne({_id:objectId(profId)},{
  //           $set:{
  //             Name:profile.name,
  //             phone:profile.phone,
  //             address:profile.address

  //           }
  //         }).then((response)=>{
  //            resolve(response)
  //         })

  //     })
  // },

  getAddressDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      let address = await db
        .get()
        .collection(collection.ADD_ADDRESS)
        .find({ userId: objectId(userId) })
        .toArray();
      console.log("add help", address);
      resolve(address);
    });
  },

  deleteAddress: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ADD_ADDRESS)
        .deleteOne({ _id: objectId(proId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  userblock:(userId)=>{
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION)
      .updateOne({_id:objectId(userId)},
      {
        $set:{isBlocked:true}
      }
      )
      resolve()
  
    })
  
  },
  userunblock:(userId)=>{
  return new Promise((resolve, reject) => {
    db.get().collection(collection.USER_COLLECTION)
    .updateOne({_id:objectId(userId)},
    {
      $set:{isBlocked:false}
    }
    )
    resolve()
  
  })
  
  },




};
