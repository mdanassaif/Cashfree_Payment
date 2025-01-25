import { useState, useEffect } from 'react'
import axios from "axios"
import { load } from '@cashfreepayments/cashfree-js'

function App() {
  const [cashfree, setCashfree] = useState(null)
  const [orderId, setOrderId] = useState("")

  // Initialize Cashfree SDK
  useEffect(() => {
    const initializeSDK = async () => {
      const cf = await load({
        mode: "sandbox",
      })
      setCashfree(cf)
    }
    initializeSDK()
  }, [])

  // Create payment session
  const createPaymentSession = async () => {
    try {
      const res = await axios.get("http://localhost:8000/payment")
      setOrderId(res.data.order_id)
      return res.data.payment_session_id
    } catch (error) {
      console.error("Error creating session:", error)
      throw error
    }
  }

  // Verify payment
  const verifyPayment = async (orderId) => {
    try {
      const res = await axios.post("http://localhost:8000/verify", { orderId })
      if (res.data && res.data.payments) {
        const paymentStatus = res.data.payments[0]?.payment_status
        if (paymentStatus === "SUCCESS") {
          alert("Payment verified successfully!")
        } else {
          alert("Payment verification failed")
        }
      }
    } catch (error) {
      console.error("Verification error:", error)
      alert("Error verifying payment")
    }
  }

  // Handle payment button click
  const handlePayment = async (e) => {
    e.preventDefault()
    if (!cashfree) return

    try {
      const sessionId = await createPaymentSession()
      const checkoutOptions = {
        paymentSessionId: sessionId,
        redirectTarget: "_modal",
        onSuccess: () => verifyPayment(orderId),
        onFailure: () => alert("Payment failed"),
      }

      cashfree.checkout(checkoutOptions)
    } catch (error) {
      console.error("Payment error:", error)
      alert("Error initiating payment")
    }
  }

  return (
    <div className="App">
      <div className="payment-container">
        <h1>Secure Payment</h1>
        <p className="amount-label">Total Amount</p>
        <p className="amount">₹1.00</p>
        <button 
          onClick={handlePayment} 
          disabled={!cashfree}
          className="payment-button"
        >
          {cashfree ? "Proceed to Pay" : "Initializing Payment..."}
        </button>
        <p className="security-note">Secure SSL encrypted payment</p>
      </div>
    </div>
  )
}

export default App