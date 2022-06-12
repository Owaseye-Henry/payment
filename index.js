const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
app.use(bodyParser())

const ejs = require("ejs")

app.set('view engine','ejs')

const session = require("express-session")

app.use(session({secret:'secret',resave:true,saveUninitialised:true}))
const port = process.env.PORT||3000

mongoose.connect("mongodb://localhost:27017/dee")
.then(()=>console.log('database connected'))
.catch((error)=>{console.log(`database connection error: ${error}`)})

app.get('/',(req,res)=>{
    const user = "this"
})

const Orders = require("./controllers/orders")
const Customers = require("./controllers/customer")

app.use("/customers", Customers)
app.use("/orders", Orders)

app.listen(port,()=>console.log(`server started on port ${port}`))