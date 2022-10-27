var db=  require('../config/connection')
var collection=require('../config/collection')
const collections = require('../config/collection')
const { ObjectID } = require('bson')
var ObjectId=require('mongodb').ObjectId

    module.exports ={
        addCategory: (categoryData) => {
            return new Promise(async (resolve, reject) => {
                categoryData.category=categoryData.category.toUpperCase()
                let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ categoryData: categoryData})
                
                if (category) {
                    reject('already exist')
                    
                } else {
                    db.get().collection(collection.CATEGORY_COLLECTION).insertOne({categoryData}).then(() => {
                        resolve()
                    })
                }
            })
        },
        viewCategory:()=>{
            return new Promise(async (resolve, reject) => {
                let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
                resolve(category)
            })
        },
        // deleteCategory:(catId)=>{
        //     return new Promise ((resolve,reject)=>{
        //        db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(catId)}).then(()=>{
        //         resolve()
        //        })
        //     })
        // } ,
        deleteCategory:(catId)=>{
            return new Promise ((resolve,reject)=>{
               db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:ObjectId(catId)}).then((response)=>{
                resolve(response)
               })
            })
        },

        // checkcategory:(userData)=>{
   
        //     return new Promise(async(resolve,reject)=>{
               
        //         let category = await db.get().collection(collections.CATEGORY_COLLECTION).findOne({ category: userData.category })
        // console.log(category);
        //        if(category){
        //         compare(userData.category).then((status)=>{
                   
        // if(status){
        //     console.log("category exists");
        //     response.category=category
        // response.status=true
        // resolve(response)
        
        // } else {
        //     resolve({ status: false })
        // }
        // })
        // } else {
        // resolve({ status: false })
        // }
        // })
        // }
        


    }