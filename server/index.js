const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
const { Cashfree } = require('cashfree-pg')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Cashfree Configuration
Cashfree.XClientId = process.env.CLIENT_ID
Cashfree.XClientSecret = process.env.CLIENT_SECRET
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX

// Generate unique order ID
const generateOrderId = () => {
  return `ORDER_${crypto.randomBytes(16).toString('hex').substr(0, 14)}`
}

// Routes
app.get('/payment', async (req, res) => {
  try {
    const request = {
      order_amount: 1.00,
      order_currency: "INR",
      order_id: generateOrderId(),
      customer_details: {
        customer_id: "customer_01",
        customer_phone: "1234567890",
        customer_name: "Mohd Khan",
        customer_email: "bg48ftff@gmail.com"
      },
    }

    const response = await Cashfree.PGCreateOrder("2023-08-01", request)
    res.json({
      order_id: response.data.order_id,
      payment_session_id: response.data.payment_session_id
    })

  } catch (error) {
    console.error("Order creation error:", error?.response?.data || error)
    res.status(500).json({
      error: error.response?.data?.message || "Payment session creation failed"
    })
  }
})

app.post('/verify', async (req, res) => {
  try {
    const { orderId } = req.body
    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId)
    
    res.json({
      payments: response.data,
      status: response.data[0]?.payment_status || "PENDING"
    })

  } catch (error) {
    console.error("Verification error:", error?.response?.data || error)
    res.status(500).json({
      error: error.response?.data?.message || "Payment verification failed"
    })
  }
})

// Start server
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})