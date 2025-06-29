"use client"

import React, { useState } from "react"
import { aiPredictionService } from "../services/aiPredictionService"
import FinanceReport from "./finance-report"
import { authService } from "../services/auth"

export default function BudgetPredictor({ onAuthRequired }) {
  const [step, setStep] = useState("selection")
  const [selectedServices, setSelectedServices] = useState({
    hotels: false,
    flights: false,
    carRental: false,
  })

  const [generalData, setGeneralData] = useState({
    destination: "",
    adults: "",
    children: "",
  })

  const [hotelData, setHotelData] = useState({
    city: "",
    adults: "",
    children: "",
    rooms: "1",
    category: "budget",
    room_type: "standard",
    checkin_date: "",
    checkout_date: "",
  })

  const [flightData, setFlightData] = useState({
    from_: "",
    to: "",
    adults: "",
    child: "",
    class_: "economy",
    num_stops: "",
    Airline_new: "",
    date: "",
  })

  const [carData, setCarData] = useState({
    car_model: "",
    seats: "",
    transmisson: "Automatic",
    capacity: "",
    city: "",
    start_date: "",
    end_date: "",
  })
   
  const [budget, setBudget] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleServiceToggle = (service) => {
    setSelectedServices((prev) => ({
      ...prev,
      [service]: !prev[service],
    }))
  }

  const handleProceedToInputs = () => {
    const hasSelection = selectedServices.hotels || selectedServices.flights || selectedServices.carRental
    if (hasSelection) {
      setStep("inputs")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
  
    if (!authService.isAuthenticated()) {
      alert("Please log in to use the budget predictor. You will be redirected to the login page.")
      if (onAuthRequired) onAuthRequired()
      return
    }
  
    setIsLoading(true)
    setError(null)
  
    try {
      let totalBudget = 0
      const selected = []
  
      // Hotel
      if (selectedServices.hotels) {
        const hotelBody = {
          city: hotelData.city,
          adults: parseInt(generalData.adults) || 0,
          children: parseInt(generalData.children) || 0,
          rooms: parseInt(hotelData.rooms) || 1,
          category: hotelData.category,
          room_type: hotelData.room_type,
          checkin_date: hotelData.checkin_date,
          checkout_date: hotelData.checkout_date,
        }
        console.log("🚀 Hotel Body Being Sent:", JSON.stringify(hotelBody, null, 2))
        const hotelResult = await aiPredictionService.predictHotel(hotelBody)
        const hotelPriceString = hotelResult?.predicted_price || "0"
        const hotelPriceNumber = parseFloat(hotelPriceString.replace(/[^0-9.]/g, ""))
        totalBudget += hotelPriceNumber
        console.log(" Hotel Price Number:", hotelPriceNumber)
        selected.push({ type: "Hotel", value: hotelPriceNumber })
      }
  
      // Car Rental
      if (selectedServices.carRental) {
        const days = Math.ceil(
          (new Date(carData.dropoffDate) - new Date(carData.pickupDate)) / (1000 * 60 * 60 * 24)
        )
  
        const carBody = {
          car_model: [carData.car_model],
          seats: [parseInt(carData.seats) || 0],
          transmisson: [carData.transmisson],
          capacity: [parseInt(carData.capacity) || 0],
          city: [carData.city],
          start_date: [carData.start_date],
          end_date: [carData.end_date],
        }
        console.log(" Car Body Being Sent:", JSON.stringify(carBody, null, 2))
  
        const carResult = await aiPredictionService.predictCarRental(carBody)
        const carPriceRaw = carResult?.predicted_prices?.[0] || "0"
        const carPriceNumber = parseFloat(
          typeof carPriceRaw === "string"
            ? carPriceRaw.replace(/[^0-9.]/g, "")
            : carPriceRaw
)

        totalBudget += carPriceNumber
        selected.push({ type: "Car Rental", value: carPriceNumber })
      }
  
      // Flight 
      if (selectedServices.flights) {
        const flightBody = {
          from_: [flightData.from_],
          to: [flightData.to],
          adults: [parseInt(flightData.adults) || 0],
          child: [parseInt(flightData.child) || 0],
          class_: [flightData.class_],
          num_stops: [parseInt(flightData.num_stops) || 0],
          Airline_new: [flightData.Airline_new],
          date: [flightData.date],
        }
        console.log(" Flight Body Being Sent:", JSON.stringify(flightBody, null, 2))
        const flightResult = await aiPredictionService.predictFlight(flightBody)
        const flightPriceRaw = flightResult?.predicted_prices?.[0] || "0"
        const flightPriceNumber = parseFloat(flightPriceRaw.replace(/[^0-9.]/g, ""))
        totalBudget += flightPriceNumber
        selected.push({ type: "Flight", value: flightPriceNumber })
      }
  
      setBudget({ total: totalBudget, breakdown: selected })
      console.log("Final Budget Object:", budget)
      setStep("finance-report")
    } catch (err) {
      setError(err.message || "An error occurred while predicting the budget")
    } finally {
      setIsLoading(false)
    }
  }
  

  const handleGeneralChange = (e) => {
    setGeneralData({
      ...generalData,
      [e.target.name]: e.target.value,
    })
  }

  const handleHotelChange = (e) => {
    setHotelData({
      ...hotelData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFlightChange = (e) => {
    setFlightData({
      ...flightData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCarChange = (e) => {
    setCarData({
      ...carData,
      [e.target.name]: e.target.value,
    })
  }

  const handleStartNewCalculation = () => {
    setStep("selection")
    setSelectedServices({ hotels: false, flights: false, carRental: false })
    setBudget(null)
    setError(null)
  }

  const renderServiceSelection = () => (
    <div className="service-selection">
      <h3>Select Services to Include in Budget</h3>

      <div className="service-buttons">
        <button
          type="button"
          className={`service-btn ${selectedServices.hotels ? "selected" : ""}`}
          onClick={() => handleServiceToggle("hotels")}
        >
          <div className="service-name">Hotels</div>
        </button>

        <button
          type="button"
          className={`service-btn ${selectedServices.flights ? "selected" : ""}`}
          onClick={() => handleServiceToggle("flights")}
        >
          <div className="service-name">Flights</div>
        </button>

        <button
          type="button"
          className={`service-btn ${selectedServices.carRental ? "selected" : ""}`}
          onClick={() => handleServiceToggle("carRental")}
        >
          <div className="service-name">Car Rental</div>
        </button>
      </div>

      <div className="selection-summary">
        <h4>Selected Services:</h4>
        <div className="selected-list">
          {selectedServices.hotels && <span className="selected-tag">Hotels</span>}
          {selectedServices.flights && <span className="selected-tag">Flights</span>}
          {selectedServices.carRental && <span className="selected-tag">Car Rental</span>}
          {!selectedServices.hotels && !selectedServices.flights && !selectedServices.carRental && (
            <span className="no-selection">No services selected</span>
          )}
        </div>
      </div>

      <button
        type="button"
        className="btn proceed-btn"
        onClick={handleProceedToInputs}
        disabled={!selectedServices.hotels && !selectedServices.flights && !selectedServices.carRental}
      >
        Proceed to Details
      </button>
    </div>
  )

  const renderInputForms = () => (
    <div className="input-forms">
      <div className="form-header">
        <h3>Trip Details</h3>
        <button type="button" className="back-btn" onClick={() => setStep("selection")}>← Back to Selection</button>
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>


        {selectedServices.hotels && (
          <div className="form-section">
            <h4> Hotel Details</h4>
            <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={hotelData.city}
                onChange={handleHotelChange}
                placeholder="City"
                required
              />
            </div>
          </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="checkin_date">Check in Date</label>
                <input
                  type="date"
                  id="checkin_date"
                  name="checkin_date"
                  value={hotelData.checkin_date}
                  onChange={handleHotelChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkout_date">Check out Date</label>
                <input
                  type="date"
                  id="checkout_date"
                  name="checkout_date"
                  value={hotelData.checkout_date}
                  onChange={handleHotelChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
            <div className="form-group">
              <label htmlFor="adults">Number of Adults</label>
              <select id="adults" name="adults" value={generalData.adults} onChange={handleGeneralChange}>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} Adult{num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="children">Number of Children</label>
              <select id="children" name="children" value={generalData.children} onChange={handleGeneralChange}>
                {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} Child{num > 0 ? "ren" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rooms">Number of Rooms</label>
                <select id="rooms" name="rooms" value={hotelData.rooms} onChange={handleHotelChange}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} Room{num > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="room_type">Room Type</label>
                <select id="room_type" name="room_type" value={hotelData.room_type} onChange={handleHotelChange}>
                  <option value="standard">Standard</option>
                  <option value="suite">Suite</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={hotelData.category} onChange={handleHotelChange}>
                <option value="budget">Budget</option>
                <option value="standard">Standard</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </div>
        )}

        {selectedServices.flights && (
          <div className="form-section">
            <h4> Flight Details</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="from_">From</label>
                <input
                  type="text"
                  id="from_"
                  name="from_"
                  value={flightData.from_}
                  onChange={handleFlightChange}
                  placeholder="From"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="to">To</label>
                <input
                  type="text"
                  id="to"
                  name="to"
                  value={flightData.to}
                  onChange={handleFlightChange}
                  placeholder="To"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="adults">Adults</label>
                <select id="adults" name="adults" value={flightData.adults} onChange={handleFlightChange}>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} Adult{num > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="child">Children</label>
                <select id="child" name="child" value={flightData.child} onChange={handleFlightChange}>
                  {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} Child{num > 0 ? "ren" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="class_">Flight Class</label>
                <select id="class_" name="class_" value={flightData.class_} onChange={handleFlightChange}>
                  <option value="economy">Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="num_stops">Stops</label>
                <input
                  type="number"
                  id="num_stops"
                  name="num_stops"
                  value={flightData.num_stops}
                  onChange={handleFlightChange}
                  placeholder="Stops"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="Airline_new">Airline</label>
                <input
                  type="text"
                  id="Airline_new"
                  name="Airline_new"
                  value={flightData.Airline_new}
                  onChange={handleFlightChange}
                  placeholder="Airline"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={flightData.date}
                  onChange={handleFlightChange}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {selectedServices.carRental && (
          <div className="form-section">
            <h4> Car Rental Details</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="car_model">Car Model</label>
                <input
                  type="text"
                  id="car_model"
                  name="car_model"
                  value={carData.car_model}
                  onChange={handleCarChange}
                  placeholder="Car Model"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="seats">Seats</label>
                <input
                  type="number"
                  id="seats"
                  name="seats"
                  value={carData.seats}
                  onChange={handleCarChange}
                  placeholder="Number of Seats"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="transmisson">Transmission</label>
                <select id="transmisson" name="transmisson" value={carData.transmisson} onChange={handleCarChange}>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="capacity">Capacity</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={carData.capacity}
                  onChange={handleCarChange}
                  placeholder="Capacity"
                  required
                />
              </div>
            
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={carData.city}
                  onChange={handleCarChange}
                  placeholder="City"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">Start Date</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={carData.start_date}
                  onChange={handleCarChange}
                  placeholder="Start Date"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="end_date">End Date</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={carData.end_date}
                  onChange={handleCarChange}
                  placeholder="End Date"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? "Calculating..." : "Calculate Budget"}
        </button>
      </form>
    </div>
  )

  if (step === "finance-report" && budget) {
    return (
      <FinanceReport
        budget={budget}
        selectedServices={selectedServices}
        generalData={generalData}
        onBackToBudget={() => setStep("inputs")}
        onStartNewCalculation={handleStartNewCalculation}
      />
    )
  }
  

  return (
    <section className="budget-predictor">
      <h2 className="section-title">Trip Budget Predictor</h2>
      <div className="budget-form">
        {step === "selection" && renderServiceSelection()}
        {step === "inputs" && renderInputForms()}
      </div>
    </section>
  )
}
