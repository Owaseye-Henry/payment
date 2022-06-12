const express = require("express")
const router = express.Router()
const customer = require("../Schemas/customer")
const items = require("../Schemas/items")
const order = require("../Schemas/order")
const got = require("got")
const flutterWave = require("flutterwave-node-v3")


router.post('/make-order',async(req,res)=>{
  try {
      const user = customer.findById(req.session.user._id).populate('cart')
      let total = 0;
      req.session.comment = req.body.comment
      for (let i in user.cart)
      {
        total+= (user.cart[i].price * user.quantity[i])
      }

      const response = await got.post("https://api.flutterwave.com/v3/payments", {
        headers: {
            Authorization: `Bearer FLWSECK_TEST-fe5f630464efb1bc8a5ac766c7287922-X`
        },
        json: {
            tx_ref: user._id+new Date.now().toString(),
            amount: total,
            currency: "NGN",
            redirect_url: "/success",
            customer: {
                email: user.email,
                phonenumber: user.phonenumber,
                name: user.fullname
            },
            customizations: {
                title: "Dee styling Payment",
                logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png"
            }
        }
    }).json();
    
    if (response.status == "success") res.redirect(response.data.link)

  } catch (err) {
    console.log(err.code);
    console.log(err.response.body);
  }
})


router.get('/success',async(req,res)=>{
    try {
        const user = customer.findById(req.session.user._id)
        const transactionRef = req.query.tx_ref
        const transactionId = req.query.transaction_id
        const itemsArray = user.cart
        const quantityArray = user.quantity

        const flw = new flutterWave(
            FLWPUBK_TEST-c22197f552879d58fc3db046f4bfe6cf-X, 
            FLWSECK_TEST-fe5f630464efb1bc8a5ac766c7287922-X
        )
        
        if (req.query.status === 'successful') {
            const transactionDetails = await Transaction.find({ref: req.query.tx_ref});
            const response = await flw.Transaction.verify({id: req.query.transaction_id});
            if (
                response.data.status === "successful"
                && response.data.amount === transactionDetails.amount
                && response.data.currency === "NGN") {
                //successful payment
                const order = new order({
                    customerName:user.fullname,
                    customerAddress:user.address, 
                    customerPhone:user.phonenumber,
                    comments:req.session.comments,
                    orderitems:itemsArray,
                    price : response.data.amount,
                    transactionRef,
                    transactionId,
                    date:new Date.now().toString(),
                    quantity:quantityArray
                })

                await order.save()

                user.cart = [] //empty cart
                user.quantity = [] // empty quantity
                
                await user.save()

                res.render("success-page",{message:"transaction was successful", url:"/dashboard"})
                
                
            } else {
                // Inform the customer their payment was unsuccessful
                res.render('failure-page', {message:"transaction was unsuccesful", url:"/dashboard"})
            }
        }



    } catch (error) {
        
    }
})

// router.get('/',async(req,res)=>{
//   try {
//       res.send('working')
//   } catch (error) {
      
//   }
// })

// router.get('/',async(req,res)=>{
//     try {
//         res.send('working')
//     } catch (error) {
        
//     }
// })

// router.get('/',async(req,res)=>{
//     try {
//         res.send('working')
//     } catch (error) {
        
//     }

// })




module.exports = router