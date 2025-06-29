"use client"

import { useEffect, useState } from "react"
import { bookingService } from "../services/api"

export default function PaymentSuccess() {
  const [status, setStatus] = useState("processing")

  useEffect(() => {
    const bookingData = JSON.parse(localStorage.getItem("pendingBooking"))

    if (bookingData) {
      bookingService.bookHotel(bookingData)
        .then(() => {
          setStatus("success")
          alert("Your booking was successful!")
          localStorage.removeItem("pendingBooking")
        })
        .catch((err) => {
          console.error("Failed to save booking:", err)
          setStatus("error")
        })
    } else {
      setStatus("error")
    }
  }, [])

  return (
    <div className="payment-success text-center p-6">
      {status === "processing" && <p>Processing your booking...</p>}
      {status === "success" && (
        <>
          <h2 className="text-2xl text-green-600 font-bold">Payment Successful!</h2>
          <p className="mt-2">Your booking has been saved to your history.</p>
        </>
      )}
      {status === "error" && (
        <>
          <h2 className="text-2xl text-red-600 font-bold">Error</h2>
          <p className="mt-2">We couldn’t complete your booking.</p>
        </>
      )}
    </div>
  )
}
