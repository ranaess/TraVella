"use client"

import React, { useState, useEffect } from "react"
import { hotelService } from "../services/api"
import { authService } from "../services/auth"
import paymentService from "../services/paymentService"
import { useRouter } from "next/navigation"

export default function HotelBooking({ onSearchResults, onAuthRequired }) {
  const [formData, setFormData] = useState({
    city: "",
    checkInDate: "",
    checkOutDate: "",
    adults: "1",
    children: "0",
    rooms: "1",
    maxPricePerNight: "",
    minPricePerNight: "",
    hotelType: "any",
    roomType: "",
    hasPool: "",
    hasGym: "",
    hasSpa: "",
    hasRestaurant: "",
    hasParking: "",
    hasWifi: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hotels, setHotels] = useState([])
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [comparisonData, setComparisonData] = useState(null)
  const [showComparison, setShowComparison] = useState(false)
  const [topRatedHotels, setTopRatedHotels] = useState([])
  const [loadingTopRated, setLoadingTopRated] = useState(false)

  const router = useRouter()

  useEffect(() => {
    fetchTopRated()
  }, [])

  const handleHotelPayment = async (hotel) => {
    const token = localStorage.getItem("token")
    if (!token) {
      onAuthRequired()
      return
    }
    const bookingPayload = {
      hotelId: hotel.id,
      checkInDate: "", 
      checkOutDate: "",
      numberOfGuests: 2,
    }

    localStorage.setItem("pendingBooking", JSON.stringify(bookingPayload))
    const payload = {
      
      amount: Math.max(hotel.price * 100, 50),
      serviceName: hotel.name || "Default Hotel",
      hotelId: hotel.id,
      userId: token,
    };
    console.log("📦 Sending payload:", payload)
  
    try {
      const session = await paymentService.createHotelCheckoutSession(payload);


if (session?.url) {
  window.location.href = session.url;
} else {
  alert("⚠️ Payment session URL not received from server.");
}
  } catch (err) {
    console.error("❌ Payment error:", err);
    alert("Error occurred: " + err?.message);
  }
};

  const fetchTopRated = async () => {
    try {
      setLoadingTopRated(true)
      const data = await hotelService.getTopRatedHotels()
      setTopRatedHotels(data)
    } catch (error) {
      console.error("Failed to load top rated hotels:", error)
    } finally {
      setLoadingTopRated(false)
    }
  }

  const getHotelImage = (hotel) => {
    const fileName = hotel.imageUrls && hotel.imageUrls.length > 0 ? hotel.imageUrls[0] : null
    return fileName ? `http://travella.runasp.net${fileName}` : "/placeholder.svg"
  }

  const getHotelPrice = (hotel) => hotel.pricePerNight || hotel.price || 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
  
    try {
      const basicSearchData = {
        city: formData.city,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        numberofPersons: {
          adults: parseInt(formData.adults),
          children: parseInt(formData.children),
        },
      }
  
      const searchResults = await hotelService.searchHotelsViaAPI(basicSearchData)

      const uniqueResults = Array.from(new Map(searchResults.map(h => [h.id, h])).values());
  
      if (!showFilters) {
        setHotels(uniqueResults)
        setSearchPerformed(true)
        if (onSearchResults) onSearchResults(uniqueResults, formData)
        return
      }
  
      const filteredResults = uniqueResults.filter((hotel) => {
        const price = getHotelPrice(hotel)
  
        if (formData.minPricePerNight && price < parseFloat(formData.minPricePerNight)) return false
        if (formData.maxPricePerNight && price > parseFloat(formData.maxPricePerNight)) return false
        if (formData.roomType && hotel.roomType !== formData.roomType) return false
        if (formData.hasPool !== "" && hotel.hasPool !== (formData.hasPool === "true")) return false
        if (formData.hasGym !== "" && hotel.hasGym !== (formData.hasGym === "true")) return false
        if (formData.hasSpa !== "" && hotel.hasSpa !== (formData.hasSpa === "true")) return false
        if (formData.hasRestaurant !== "" && hotel.hasRestaurant !== (formData.hasRestaurant === "true")) return false
        if (formData.hasParking !== "" && hotel.hasParking !== (formData.hasParking === "true")) return false
        if (formData.hasWifi !== "" && hotel.hasWifi !== (formData.hasWifi === "true")) return false
  
        return true
      })
  
      setHotels(filteredResults)
      setSearchPerformed(true)
      if (onSearchResults) onSearchResults(filteredResults, formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while searching hotels")
    } finally {
      setIsLoading(false)
    }
  }
  

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "maxPricePerNight" && value.includes("-")) {
      const [min, max] = value.split("-")
      setFormData((prev) => ({ ...prev, minPricePerNight: min, maxPricePerNight: max }))
    } else if (name === "maxPricePerNight" && value === "13000+") {
      setFormData((prev) => ({ ...prev, minPricePerNight: "13000", maxPricePerNight: "" }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleBookNow = (hotel) => {
    const numberofPersons = Number(formData.adults) + Number(formData.children)
    router.push(`/booking-confirmation?hotelId=${hotel.id}&checkInDate=${formData.checkInDate}&checkOutDate=${formData.checkOutDate}&numberofPersons=${numberofPersons}`)
  }

  const handleBookHotel = async (hotelId) => {
    if (!authService.isAuthenticated()) {
      if (onAuthRequired) onAuthRequired()
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const bookingData = {
        hotelId,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        numberofPersons: Number(formData.adults) + Number(formData.children),
      }

      await hotelService.bookHotel(bookingData)
      alert("Hotel booked successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while booking the hotel")
    } finally {
      setIsLoading(false)
    }
  }

  

  return (
    <section className="booking-section">
      <h2 className="section-title">Book Hotels</h2>

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input type="text" name="city" value={formData.city} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Check-in</label>
            <input type="date" name="checkInDate" value={formData.checkInDate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Check-out</label>
            <input type="date" name="checkOutDate" value={formData.checkOutDate} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Adults</label>
            <select name="adults" value={formData.adults} onChange={handleChange}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Children</label>
            <select name="children" value={formData.children} onChange={handleChange}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search Hotels"}
        </button>

      </form>






      <div className="top-rated-section mt-10">
        <h3 className="text-xl font-semibold mb-2">Top Rated Hotels</h3>
        {loadingTopRated ? (
          <p>Loading top rated hotels...</p>
        ) : topRatedHotels.length > 0 ? (
          <div className="hotel-list">
            {topRatedHotels.map((hotel) => (
              <div key={hotel.id} className="hotel-card">
                <div className="hotel-image">
                  <img src={getHotelImage(hotel)} alt={hotel.name} />
                </div>
                <div className="hotel-details">
                  <h4>{hotel.name}</h4>
                  <p>City: {hotel.city}</p>
                  <p>Country: {hotel.countery}</p>
                  <p>Location: {hotel.location || 'N/A'}</p>
                  <p>Price: ${getHotelPrice(hotel)}</p>
                  <p>Rating: {hotel.rate}★</p>
                  <p>Facility: {hotel.facility}</p>
                  <p>Cancellation: {hotel.cancellationPolicy}</p>
                  <button className="btn" onClick={() => handleHotelPayment(hotel)} disabled={isLoading}>
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No top rated hotels found.</p>
        )}
      </div>
    </section>
  )
}
