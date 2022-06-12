const express = require("express")
const router = express.Router()
const customers = require("../Schemas/customer")
const items = require("../Schemas/items")
const orders = require("../Schemas/order")

router.get('/dashboard',async(req,res)=>{
  try {
      //change to find by id
     const one= await customers.find({}).populate([{path:"cart",model:["item"]},{path:"orders",model:"order"}])
     const user = one[0]

     res.send(user)
  } catch (error) {
    console.log(`dashboard error: ${error}`)
  }
})

router.get('/item/:id',async(req,res)=>{
    try {
        const item = await items.findById(req.params.id)
        res.send(item)
    } catch (error) {
        console.log(`get single item error: ${error}`)
    }
  })

router.get('/shop',async(req,res)=>{
    try {
        const all = await items.find({})
        res.send(all)

    } catch (error) {
        console.log(`shop error: ${error}`)
    }
  })


  router.get('/cart-add/:id',async(req,res)=>{
    try {
        const user = await customers.findById(req.session.user._id)
        const item = await items.findById(req.params.id)
        let quantity = req.body
        if(quantity < 1) quantity = 1
        
        if(quantity <= item.AvailableQuantity){
            item.AvailableQuantity = item.AvailableQuantity - quantity
            await item.save()
            user.cart.push(req.params.id)
            user.quantity.push(quantity)
            await user.save()

        } else{
             res.send("order more than available quanitity")
        }

    } catch (error) {
        console.log(`cart-add error: ${error}`)
    }
  })

  router.get('/cart-remove/:id',async(req,res)=>{
    try {
        const user = await customers.findById(req.session.user._id)
        const item = await items.findById(req.params.id)
        const itemIndex = user.cart.indexOf(req.params.id.toString())

        item.AvailableQuantity = item.AvailableQuantity + user.quantity.splice(itemIndex,1)
        await item.save()
        user.cart.splice(itemIndex,1)
        await user.save()

    } catch (error) {
        console.log(`cart-remove error: ${error}`)
    }
  })

  
module.exports = router