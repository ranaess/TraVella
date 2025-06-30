"use client"

import React, { useState, useEffect } from "react"
import { taxiService } from "../services/api"
import { authService } from "../services/auth"
import paymentService from "../services/paymentService"

export default function TaxiBooking({ onSearchResults, onAuthRequired }) {
  const [formData, setFormData] = useState({
    pickUpLocation: "",
    dropOffLocation: "",
    date: new Date().toISOString().split("T")[0],
    passengers: {
      adults: 1,
      children: 0
    },
    minPrice: "",
    maxPrice: "",
    minTime: "",
    maxTime: "",
    driverAgeMin: "",
    driverAgeMax: "",
    minDistance: "",
    maxDistance: "",
    minRating: ""
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [taxis, setTaxis] = useState([])
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadAllTaxis()
  }, [])

  const loadAllTaxis = async () => {
    try {
      setIsLoading(true)
      const data = await taxiService.getAllTaxis()
      setTaxis(data)
      setSearchPerformed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load taxis")
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailableTaxis = async () => {
    try {
      setIsLoading(true)
      const data = await taxiService.getAvailableTaxis()
      setTaxis(data)
      setSearchPerformed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load available taxis")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const payload = {
        pickUpLocation: formData.pickUpLocation,
        dropOffLocation: formData.dropOffLocation,
        date: formData.date,
        passengers: {
          adults: parseInt(formData.passengers.adults),
          children: parseInt(formData.passengers.children)
        }
      }

      const results = await taxiService.searchTaxis(payload)
      setTaxis(results)
      setSearchPerformed(true)

      if (onSearchResults) onSearchResults(results, formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while searching")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaxiPayment = async (taxi) => {
    const token = localStorage.getItem("token")
      if (!token) {
        onAuthRequired()
        return }
    const payload = {
      amount: Math.max(taxi.price * 100, 50),
        serviceName: taxi.name || "Default Taxi",
        taxiId: taxi.id,
    };
  
    try {
      const session = await paymentService.createTaxiCheckoutSession(payload);
      if (session.url) {
        window.location.href = session.url; 
      } else {
        alert("Failed to create payment session");
      }
    } catch (err) {
      console.error("❌ Payment error:", err);
    }
  };

  const getTaxiImage = (taxi) => {
    const baseUrl = "http://travella.runasp.net";
    const fileName = (taxi.imageUrls && taxi.imageUrls.length > 0) ? taxi.imageUrls[0] : null;
  
    if (!fileName) return "/placeholder.svg";
  
    const normalizedPath = fileName.startsWith("/") ? fileName : `/${fileName}`;
    return `${baseUrl}${normalizedPath}`;
  }

  const handleFilter = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const payload = {
        minPrice: parseFloat(formData.minPrice) || 0,
        maxPrice: parseFloat(formData.maxPrice) || 0,
        minTime: parseFloat(formData.minTime) || 0,
        maxTime: parseFloat(formData.maxTime) || 0,
        driverAgeMin: parseFloat(formData.driverAgeMin) || 0,
        driverAgeMax: parseFloat(formData.driverAgeMax) || 0,
        minDistance: parseFloat(formData.minDistance) || 0,
        maxDistance: parseFloat(formData.maxDistance) || 0,
        minRating: parseFloat(formData.minRating) || 0
      }

      const results = await taxiService.filterTaxis(payload)
      setTaxis(results)
      setSearchPerformed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while filtering")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "adults" || name === "children") {
      setFormData((prev) => ({
        ...prev,
        passengers: {
          ...prev.passengers,
          [name]: value
        }
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleBookTaxi = async (taxiId) => {
    if (!authService.isAuthenticated()) {
      alert("Please log in to book a taxi.")
      if (onAuthRequired) onAuthRequired()
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const payload = {
        taxiId,
        pickUpLocation: formData.pickUpLocation,
        dropOffLocation: formData.dropOffLocation,
        date: formData.date,
        passengers: {
          adults: parseInt(formData.passengers.adults),
          children: parseInt(formData.passengers.children)
        }
      }

      await taxiService.bookTaxi(payload)
      alert("Taxi booked successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while booking the taxi")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <section className="booking-section">
      <h2 className="section-title">Book a Taxi</h2>

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pickUpLocation">Pickup Location</label>
            <input
              type="text"
              id="pickUpLocation"
              name="pickUpLocation"
              value={formData.pickUpLocation || ""}
              onChange={handleChange}
              placeholder="Enter pickup location"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>


        <div className="form-row">
          <div className="form-group">
            <label htmlFor="passengers">Number of Passengers</label>
            <select id="adults" name="adults" value={formData.adults} onChange={handleChange}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num} Adult{num > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <select id="passengers" name="passengers" value={formData.passengers} onChange={handleChange}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num} Child{num > 0 ? "ren" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? "Searching..." : formData.bookingType === "now" ? "Find Taxi Now" : "Schedule Ride"}
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {searchPerformed && !isLoading && (
         <>
            <div className="taxi-list">
            <h3 className="text-xl font-semibold mb-2">Available Taxis</h3>  
              {taxis.map((taxi) => (
                <div key={taxi.id} className="taxi-card">
                  <div className="result-image">
                    <img src={getTaxiImage(taxi)} alt={taxi.carModel} />
                  </div>
                  <div className="taxi-details">
                    <h4>{taxi.carModel}</h4>
                    <p>Company: {taxi.company}</p>
                    <p>Price: EGP {taxi.price}</p>
                    {taxi.tripTime && (
                      <p>Trip Time: {new Date(taxi.tripTime).toLocaleString()}</p>
                    )}
                    <p>Driver Age: {taxi.driverAge}</p>
                    <p>Rate: {taxi.rate}</p>
                    <p>Distance: {taxi.distance} km</p>
                    <button className="btn" onClick={() => handleTaxiPayment(taxi)} disabled={isLoading}>
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
    </section>
  )
}