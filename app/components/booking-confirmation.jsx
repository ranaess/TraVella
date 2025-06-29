"use client"

import { useState } from "react"
import paymentService from "../services/paymentService"
export default function BookingConfirmation({ bookingDetails, onBackToHome }) {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState("")

  const handleStripePayment = async () => {
    setIsRedirecting(true)
    setError("")

    try {

      const session = await paymentService.createCheckoutSession({
        amount: bookingDetails.totalAmount * 100, 
        serviceName: bookingDetails.serviceName,
        hotelId: bookingDetails.hotelId || 0,
      })

      await stripe.redirectToCheckout({ sessionId: session.id })
    } catch (err) {
      setError("Failed to start payment. Please try again.")
      setIsRedirecting(false)
    }
  }

  return (
    <div className="booking-confirmation-page">
      <div className="booking-confirmation-container">
        <h2>Booking Not Confirmed Yet</h2>
        <p>You need to complete payment to confirm your booking.</p>
        <button onClick={handleStripePayment} className="btn btn-primary" disabled={isRedirecting}>
          {isRedirecting ? "Redirecting to payment..." : `Pay ${bookingDetails.currency} ${bookingDetails.totalAmount.toFixed(2)}`}
        </button>
        {error && <p className="error-message">{error}</p>}

        <button className="btn" onClick={onBackToHome}> Back to Home</button>
      </div>
    </div>
  )
}
