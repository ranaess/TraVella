"use client"

import React, { useState } from "react"
import { flightService } from "../services/api"
import { authService } from "../services/auth"
import { useRouter } from "next/navigation"

export default function FlightBooking({ onSearchResults, onAuthRequired }) {
  const [formData, setFormData] = useState({
    fromLocation: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    category: "economy",
    adults: "1",
    children: "0",
  })

  const [filterData, setFilterData] = useState({
    minPrice: "",
    maxPrice: "",
    airline: "",
    departureTime: "",
    arrivalTime: "",
    stops: ""
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [flights, setFlights] = useState([])
  const [searchPerformed, setSearchPerformed] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const departureTime = formData.departureTime
        ? new Date(`${formData.departureTime}T00:00:00Z`).toISOString()
        : null

      const arrivalTime = formData.arrivalTime
        ? new Date(`${formData.arrivalTime}T23:59:59Z`).toISOString()
        : null

      if (!departureTime || !arrivalTime) {
        setError("Please select valid departure and arrival dates.")
        setIsLoading(false)
        return
      }

      const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

      const searchParams = {
        fromLocation: formData.fromLocation.trim(),
        destination: formData.destination.trim(),
        departureTime,
        arrivalTime,
        category: capitalize(formData.category),
        numberOfpersons: {
          adults: parseInt(formData.adults),
          children: parseInt(formData.children),
        },
      }

      const results = await flightService.searchFlights(searchParams)
      console.log("Search API response:", results)
      console.log("Sending searchParams:", searchParams)
      console.log("Sent search params:", searchParams)
      setFlights(results)
      setSearchPerformed(true)
      if (onSearchResults) onSearchResults(results, formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while searching for flights")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilter = async () => {
    try {
      const filterParams = {
        minPrice: parseFloat(filterData.minPrice) || 0,
        maxPrice: parseFloat(filterData.maxPrice) || 0,
        airline: filterData.airline,
        departureTime: filterData.departureTime ? new Date(`${filterData.departureTime}T00:00:00Z`).toISOString() : null,
        arrivalTime: filterData.arrivalTime ? new Date(`${filterData.arrivalTime}T23:59:59Z`).toISOString() : null,
        stops: parseInt(filterData.stops) || 0
      }

      const filtered = await flightService.filterFlights(filterParams)
      setFlights(filtered)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while filtering flights")
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFilterChange = (e) => {
    setFilterData({
      ...filterData,
      [e.target.name]: e.target.value,
    })
  }

  const handleBookFlight = async (flightId) => {
    if (!authService.isAuthenticated()) {
      if (onAuthRequired) onAuthRequired()
      return
    }

    try {
      const bookingData = {
        flightId,
        passengerCount: parseInt(formData.adults) + parseInt(formData.children),
        cabinClass: formData.category,
      }

      await flightService.bookFlight(bookingData)
      router.push("/booking-confirmation")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while booking the flight")
    }
  }

  return (
    <section className="booking-section">
      <h2 className="section-title">Book Flights</h2>

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-row">
        <div className="form-group">
          <label htmlFor="fromLocation">From</label>
          <input
            type="text"
            id="fromLocation"
            name="fromLocation"
            value={formData.fromLocation}
            onChange={handleChange}
            placeholder="From Location"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="destination">Destination</label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="Destination"
            required
          />
        </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="departureTime">Departure Time</label>
            <input
              type="date"
              id="departureTime"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="arrivalTime">Arrival Time</label>
            <input
              type="date"
              id="arrivalTime"
              name="arrivalTime"
              value={formData.arrivalTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Class</label>
            <select id="category" name="category" value={formData.category} onChange={handleChange}>
              <option value="economy">Economy</option>
              <option value="business">Business</option>
              <option value="first">First Class</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="adults">Adults</label>
            <input
              type="number"
              id="adults"
              name="adults"
              min="1"
              value={formData.adults}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="children">Children</label>
            <input
              type="number"
              id="children"
              name="children"
              min="0"
              value={formData.children}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search Flights"}
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {searchPerformed && !isLoading && (
        <>
            <div className="flight-list">
              {flights.map((flight) => (
                <div key={flight.id} className="flight-card">
                  <div className="flight-header">
                    <div className="airline">{flight.airline}</div>
                  </div>
                  <div className="flight-details">
                    <p>From: {flight.fromLocation}</p>
                    <p>To: {flight.destination}</p>
                    <p>Departure: {new Date(flight.departureTime).toLocaleString()}</p>
                    <p>Arrival: {new Date(flight.arrivalTime).toLocaleString()}</p>
                    <p>Stops: {flight.stops}</p>
                    <p>Class: {flight.category}</p>
                    <p>Price: ${flight.price}</p>
                    <button className="btn" onClick={() => handleBookFlight(flight.id)} disabled={isLoading}>
                      Book Now
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
