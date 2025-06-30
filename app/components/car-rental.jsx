"use client"

import React, { useState, useEffect } from "react"
import { carService } from "../services/api"
import paymentService from "../services/paymentService"
import { authService } from "../services/auth"

export default function CarRental({ onSearchResults, onAuthRequired }) {
  const [formData, setFormData] = useState({
    pickupLocation: "",
    pickupDate: "",
    pickupTime: "",
    rentType: "",
    carType: "",
    transmission: "",
    brand: "",
    engineType: "",
    driverAge: "",
    minPrice: "",
    maxPrice: "",
    rating: ""
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cars, setCars] = useState([])
  const [allCars, setAllCars] = useState([])
  const [searchPerformed, setSearchPerformed] = useState(false)

  useEffect(() => {
    loadAllCars()
  }, [])

  const loadAllCars = async () => {
    try {
      setIsLoading(true)
      const allCarsData = await carService.getAllCars()
      setAllCars(allCarsData)
      setCars(allCarsData)
      setSearchPerformed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cars")
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailableCars = async () => {
    try {
      setIsLoading(true)
      const availableCars = await carService.getAvailableCars()
      setCars(availableCars)
      setSearchPerformed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load available cars")
    } finally {
      setIsLoading(false)
    }
  }

  const parseDriverAge = (range) => {
    if (!range) return 0
    const [min, max] = range.split("-").map(Number)
    return Math.round((min + max) / 2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!formData.pickupDate) {
        throw new Error("Please provide both date.")
      }

      const isoDate = new Date(formData.pickupDate).toISOString().split("T")[0]

      const searchParams = {
        pickUpLocation: formData.pickupLocation,
        date: isoDate,
        rentType: formData.rentType
      }

      const results = await carService.searchCars(searchParams)
      setCars(results)
      setSearchPerformed(true)

      const mapCarToSearchResult = (car) => ({
        id: car.id,
        name: car.brand, 
        imageUrl: car.imageUrls?.[0] || "/placeholder.svg",
        location: car.pIckUpLocation || car.pickUpLocation || "Unknown Location",
        rating: car.rating || 4,
        currency: "EGP",
        price: car.price,
        type: "car",
        brand: car.brand,
        carType: car.carType,
        transmission: car.transmission,
        engineType: car.engineType,
        rentType: car.rentType,
        pickUpLocation: car.pIckUpLocation || car.pickUpLocation,
        dropOffLocation: car.dropOffLocation,
      })
      
      

      if (onSearchResults) {
        onSearchResults(results.map(mapCarToSearchResult), formData)

      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while searching for cars")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCarRentalPayment = async (carRental) => {
    const token = localStorage.getItem("token")
      if (!token) {
        onAuthRequired()
        return }
    const payload = {
      amount: Math.max(carRental.price * 100),
      serviceName: carRental.name || "Default Car Rental",
      carRentalId: carRental.id,
    };
  
    try {
      const session = await paymentService.createCarRentalCheckoutSession(payload);
      if (session.url) {
        window.location.href = session.url; 
      } else {
        alert("Failed to create payment session");
      }
    } catch (err) {
      console.error("❌ Payment error:", err);
    }
  };

  const handleFilter = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const filterParams = {
        minPrice: Number(formData.minPrice) || 0,
        maxPrice: Number(formData.maxPrice) || 0,
        carType: formData.carType || "",
        transmission: formData.transmission || "",
        brand: formData.brand || "",
        engineType: formData.engineType || "",
        driverAge: parseDriverAge(formData.driverAge),
        minRating: Number(formData.rating) || 0
      }

      const results = await carService.filterCars(filterParams)
      setCars(results)
      setSearchPerformed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while filtering cars")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleBookCar = async (carId) => {
    if (!authService.isAuthenticated()) {
      if (onAuthRequired) {
        onAuthRequired()
      }
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const bookingData = {
        carId,
        pIckupLocation: formData.pIckupLocation,
        dropoffLocation: formData.pickupLocation,
        driverAgeRange: parseDriverAge(formData.driverAge),
        driverOption: formData.driverOption
      }

      await carService.bookCar(bookingData)
      alert("Car booked successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while booking the car")
    } finally {
      setIsLoading(false)
    }
  }

  const getCarPrice = (car) => car.price || 0

  return (
    <section className="booking-section">
      <h2 className="section-title">Rent a Car</h2>
      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pickupLocation">Pick-up Location</label>
            <input
              type="text"
              id="pickupLocation"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              placeholder="City or airport"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pickupDate">Pick-up Date</label>
            <input
              type="date"
              id="pickupDate"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleChange}
              required
            />
          </div>
         </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="rentType">Rent Type</label>
            <select id="rentType" name="rentType" value={formData.rentType} onChange={handleChange}>
              <option value="with driver">With Driver</option>
              <option value="without driver">Without Driver</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search Cars"}
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {searchPerformed && !isLoading && (
        <>
            <div className="car-list">
            <h3 className="text-xl font-semibold mb-2">Available Cars</h3>  
              {cars.map((car) => (
                <div key={car.id} className="car-card">
                  <div className="car-details">
                    <h4>{car.brand}</h4>
                    <p className="car-type">{car.carType}</p>
                    <div className="car-specs">
                      {car.transmission && <span className="spec-tag">🔧 {car.transmission}</span>}
                      {car.engineType && <span className="spec-tag">⚙️ {car.engineType}</span>}
                    </div>
                    <p className="car-price">EGP {car.price} per day</p>
                    <p className="car-location">📍 {car.pIckUpLocation}</p>
                    <div className="car-card-actions">
                      <button className="btn" onClick={() =>  handleCarRentalPayment(car)}>Book Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </>
      )}
    </section>
  )
}
