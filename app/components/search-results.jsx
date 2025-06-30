"use client"
import { useState, useEffect } from "react"
import { authService } from "../services/auth"
import paymentService from "../services/paymentService"
import { useRouter } from 'next/navigation'


export default function SearchResults({
  results,
  searchType,
  searchParams,
  onBookNow,
  isLoading = false,
  onAuthRequired,
}) {
  const [filterBy, setFilterBy] = useState({
    minPrice: "",
    maxPrice: "",
    airline: "",
    stops: "",
    minRating: "",
    roomType: "",
    hasPool: "",
    hasGym: "",
    hasSpa: "",
    hasRestaurant: "",
    hasParking: "",
    hasWifi: "",
    minPricePerNight: "",
    maxPricePerNight: "",
    carType: "",
    transmission: "",
    brand: "",
    engineType: "",
    driverAge: "",
    minRating: "",
    minTime: "",
    maxTime: "",
    driverAgeMin: "",
    driverAgeMax: "",
    minDistance: "",
    maxDistance: "",
    minRating: "",

  })
  useEffect(() => {
    console.log("searchType:", searchType);
  }, [searchType]);

  const getTypeIcon = (type) => {
    switch (type) {
      case "hotel":
        return "Hotel"
      case "flight":
        return "Flight"
      case "car":
        return "Car"
      case "taxi":
        return "Taxi"
      default:
        return "Search"
    }
  }

  let uniqueResults = results

if (searchType === "hotel") {
  const nameMap = new Map()
  for (const item of results) {
    const key = item.name?.toLowerCase()
    if (!nameMap.has(key)) {
      nameMap.set(key, item)
    } else {
      const existing = nameMap.get(key)
      if (
        (!existing.imageUrls || existing.imageUrls.length === 0) &&
        item.imageUrls &&
        item.imageUrls.length > 0
      ) {
        nameMap.set(key, item)
      }
    }
  }
  uniqueResults = Array.from(nameMap.values())
}


  const filteredResults = sortedResults.filter((result) => {
    if (filterBy.minPrice && result.price < Number.parseFloat(filterBy.minPrice)) return false
    if (filterBy.maxPrice && result.price > Number.parseFloat(filterBy.maxPrice)) return false
    if (filterBy.minRating && (result.rating || result.rate || 0) < Number.parseFloat(filterBy.minRating)) return false
    if (searchType === "hotel") {
      if (filterBy.roomType && result.roomType !== filterBy.roomType) return false;
      if (filterBy.hasPool !== "" && result.hasPool !== (filterBy.hasPool === "true")) return false;
      if (filterBy.hasGym !== "" && result.hasGym !== (filterBy.hasGym === "true")) return false;
      if (filterBy.hasSpa !== "" && result.hasSpa !== (filterBy.hasSpa === "true")) return false;
      if (filterBy.hasRestaurant !== "" && result.hasRestaurant !== (filterBy.hasRestaurant === "true")) return false;
      if (filterBy.hasParking !== "" && result.hasParking !== (filterBy.hasParking === "true")) return false;
      if (filterBy.hasWifi !== "" && result.hasWifi !== (filterBy.hasWifi === "true")) return false;
    }
    if (searchType === "flight") {
      if (filterBy.airline && result.airline !== filterBy.airline) return false;
      if (filterBy.stops && result.stops !== filterBy.stops) return false;
    }
    if (searchType === "car") {
      if (filterBy.carType && result.carType !== filterBy.carType) return false;
      if (filterBy.transmission && result.transmission !== filterBy.transmission) return false;
      if (filterBy.engineType && result.engineType !== filterBy.engineType) return false;
      if (filterBy.driverAge && result.driverAge !== filterBy.driverAge) return false;
      if (filterBy.minRating && result.rate < filterBy.minRating) return false;
    }
    if (searchType === "taxi") {
      if (filterBy.minTime && result.tripTime < filterBy.minTime) return false;
      if (filterBy.maxTime && result.tripTime > filterBy.maxTime) return false;
      if (filterBy.minDistance && result.distance < filterBy.minDistance) return false;
      if (filterBy.maxDistance && result.distance > filterBy.maxDistance) return false;
      if (filterBy.minRating && result.rate < filterBy.minRating) return false;
      if (filterBy.driverAgeMin && result.driverAge < filterBy.driverAgeMin) return false;
      if (filterBy.driverAgeMax && result.driverAge > filterBy.driverAgeMax) return false;
    }
    
    return true
  })

  

  const formatSearchParams = () => {
    const params = []
    if (searchParams.destination) params.push(` ${searchParams.destination}`)
    if (searchParams.checkIn) params.push(` ${searchParams.checkIn}`)
    if (searchParams.checkOut) params.push(` ${searchParams.checkOut}`)
    if (searchParams.guests) params.push(` ${searchParams.guests} guests`)
    if (searchParams.passengers) params.push(` ${searchParams.passengers} passengers`)
    if (searchParams.participants) params.push(` ${searchParams.participants} participants`)
    return params.join(" • ")
  }


  

  const handleAuthRequired = () => {
    setActiveSection("auth")
    setAuthMode("login")
    setRedirectAfterAuth(activeSection)
  }
  

  
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
  
    try {
      const session = await paymentService.createHotelCheckoutSession(payload);


if (session?.url) {
  window.location.href = session.url;
} else {
  console.error("❌ session.url is undefined. Full session object:", session);
  alert("⚠️ Payment session URL not received from server.");
}
  } catch (err) {
    console.error("❌ Payment error:", err);
    alert("Error occurred: " + err?.message);
  }
};


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


const handleFlightPayment = async (flight) => {
  const token = localStorage.getItem("token")
    if (!token) {
      onAuthRequired()
      return }
  const payload = {
    amount: Math.max(flight.price * 100),
      serviceName: flight.name || "Default Flight",
      flightId: flight.id,
  };

  try {
    const session = await paymentService.createFlightCheckoutSession(payload);
    if (session.url) {
      window.location.href = session.url; 
    } else {
      alert("Failed to create payment session");
    }
  } catch (err) {
    console.error("❌ Payment error:", err);
  }
};



 

  const getHotelImage = (hotel) => {
    const fileName = hotel.imageUrls && hotel.imageUrls.length > 0 ? hotel.imageUrls[0] : null
    return fileName ? `http://travella.runasp.net${fileName}` : "/placeholder.svg"
  }

  const getTaxiImage = (taxi) => {
    const baseUrl = "http://travella.runasp.net";
    const fileName = (taxi.imageUrls && taxi.imageUrls.length > 0) ? taxi.imageUrls[0] : null;
  
    if (!fileName) return "/placeholder.svg";
  
    const normalizedPath = fileName.startsWith("/") ? fileName : `/${fileName}`;
    return `${baseUrl}${normalizedPath}`;
  };
  
  

  
  

  const getCarImage = (car) => {
    const baseUrl = "http://travella.runasp.net";
  
    const fileName =
      car.imageUrl ||                      
      car.imageUrls?.[0] ||                
      car.image ||                         
      null;
  
    return fileName ? `${baseUrl}${fileName}` : "/placeholder.svg";
  };

  useEffect(() => {
    const min = filterBy.minPricePerNight?.split("-")[0] || "";
    const max = filterBy.maxPricePerNight?.includes("+")
      ? "99999"
      : filterBy.maxPricePerNight?.split("-")[1] || "";
  
    setFilterBy((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));
  }, [filterBy.minPricePerNight, filterBy.maxPricePerNight]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilterBy((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  

  return (
    <div className="search-results-page">
      <div className="search-results-container">
        <div className="search-results-header">
          <div className="search-summary">
            <h2>
             {searchType.charAt(0).toUpperCase() + searchType.slice(1)} Search Results
            </h2>
            <p className="results-count">
              {filteredResults.length} {searchType}
              {filteredResults.length !== 1 ? "s" : ""} found
            </p> 
          </div>
        </div>

        <div className="search-results-content">
        
        
        {searchType === "hotel" && (
          <div className="search-filters" style={{ width: "100%", marginBottom: "24px" }}>
            <h3>Filter Results</h3>
            <div
    className="form-row"
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "1rem",
      marginBottom: "12px",
    }}
  >
    <div className="form-group">
      <label>Min Price Per Night</label>
      <input type="text" name="minPricePerNight" value={filterBy.minPricePerNight} onChange={handleChange} />
    </div>

    <div className="form-group">
      <label>Max Price</label>
      <input type="text" name="maxPricePerNight" value={filterBy.maxPricePerNight} onChange={handleChange} />
    </div>

    <div className="form-group">
      <label>Room Type</label>
      <select name="roomType" value={filterBy.roomType} onChange={handleChange}>
        <option value="">Any</option>
        <option value="standard">Standard</option>
        <option value="suite">Suite</option>
      </select>
    </div>
  </div>

  <div
    className="form-row"
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
      gap: "12px",
      marginTop: "6px",
    }}
  >
    {["hasPool", "hasGym", "hasSpa", "hasRestaurant", "hasParking", "hasWifi"].map((amenity) => (
      <div className="form-group" key={amenity}>
        <label style={{ fontSize: "13px" }}>{amenity.replace("has", "Has ")}</label>
        <select
          name={amenity}
          value={filterBy[amenity]}
          onChange={handleChange}
          style={{ fontSize: "13px" }}
        >
          <option value="">--</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    ))}
  </div>
  

  <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
    <button
      className="btn btn-secondary"
      style={{
        padding: "8px 16px",
        fontWeight: "bold",
        borderRadius: "6px",
        backgroundColor: "#ccc",
        color: "#000",
        border: "1px solid #999",
        cursor: "pointer",
      }}
      onClick={() =>
        setFilterBy((prev) => ({
          ...prev,
          minPrice: "",
          maxPrice: "",
          minRating: "",
          roomType: "",
          hasPool: "",
          hasGym: "",
          hasSpa: "",
          hasRestaurant: "",
          hasParking: "",
          hasWifi: "",
          minPricePerNight: "",
          maxPricePerNight: "",
        }))
      }
    >
      Clear Filters
    </button>
  </div>
</div>
)}



{searchType === "flight" && (

          <div className="search-filters" style={{ width: "100%", marginBottom: "24px" }}>
            <h3>Filter Results</h3>
            <div
    className="form-row"
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "1rem",
      marginBottom: "12px",
    }}
  >
    <div className="form-group">
      <label>Min Price</label>
      <input type="text" name="minPrice" value={filterBy.minPrice} onChange={handleChange} />
    </div>

    <div className="form-group">
      <label>Max Price</label>
      <input type="text" name="maxPrice" value={filterBy.maxPrice} onChange={handleChange} />
    </div>

    <div className="form-group">
      <label>Airline</label>
      <input type="text" name="airline" value={filterBy.airline} onChange={handleChange} />
 
    </div>

    <div className="form-group">
      <label>Stops</label>
      <input type="number" name="stops" value={filterBy.stops} onChange={handleChange} />
 
    </div>
  </div>
  

  <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
    <button
      className="btn btn-secondary"
      style={{
        padding: "8px 16px",
        fontWeight: "bold",
        borderRadius: "6px",
        backgroundColor: "#ccc",
        color: "#000",
        border: "1px solid #999",
        cursor: "pointer",
      }}
      onClick={() =>
        setFilterBy((prev) => ({
          ...prev,
          minPrice: "",
          maxPrice: "",
          airline: "",
          stops: "",
        }))
      }
      
    >
      Clear Filters
    </button>
  </div>
</div>
)}

{searchType === "car" && (

<div className="search-filters" style={{ width: "100%", marginBottom: "24px" }}>
  <h3>Filter Results</h3>
  <div
className="form-row"
style={{
display: "flex",
flexWrap: "wrap",
gap: "1rem",
marginBottom: "12px",
}}
>
<div className="form-group">
<label>Min Price</label>
<input type="text" name="minPrice" value={filterBy.minPrice} onChange={handleChange} />
</div>

<div className="form-group">
<label>Max Price</label>
<input type="text" name="maxPrice" value={filterBy.maxPrice} onChange={handleChange} />
</div>

<div className="form-group">
<label>Car Type</label>
<select name="carType" value={filterBy.carType} onChange={handleChange}>
<option value="">Any</option>
<option value="sedan">Sedan</option>
<option value="suv">SUV</option>
<option value="hatchback">Hatchback</option>
</select>

</div>

<div className="form-group">
<label>Transmission</label>
<select name="transmission" value={filterBy.transmission} onChange={handleChange}>
<option value="">Any</option>
<option value="manual">Manual</option>
<option value="automatic">Automatic</option>
</select>
</div>

<div className="form-group">
<label>Brand</label>
<input type="text" name="brand" value={filterBy.brand} onChange={handleChange} />
</div>

<div className="form-group">
<label>Engine Type</label>
<select name="engineType" value={filterBy.engineType} onChange={handleChange}>
<option value="">Any</option>
<option value="petrol">Petrol</option>
<option value="diesel">Diesel</option>
<option value="electric">Electric</option>
</select>
</div>

<div className="form-group">
<label>Driver Age</label>
<select name="driverAge" value={filterBy.driverAge} onChange={handleChange}>
<option value="">Any</option>
<option value="18-25">18 - 25 years</option>
<option value="25-35">25 - 35 years</option>
<option value="35-45">35 - 45 years</option>
<option value="45-55">45 - 55 years</option>
<option value="55-65">55 - 65 years</option>
</select>
</div>

<div className="form-group">
<label>Rating</label>
<select name="rating" value={filterBy.rating} onChange={handleChange}>
<option value="">Any</option>
<option value="1">1 ★</option>
<option value="2">2 ★</option>
<option value="3">3 ★</option>
<option value="4">4 ★</option>
<option value="5">5 ★</option>
</select> 
</div>





</div>



<div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
<button
className="btn btn-secondary"
style={{
padding: "8px 16px",
fontWeight: "bold",
borderRadius: "6px",
backgroundColor: "#ccc",
color: "#000",
border: "1px solid #999",
cursor: "pointer",
}}
onClick={() =>
setFilterBy((prev) => ({
...prev,
minPrice: "",
maxPrice: "",
airline: "",
stops: "",
}))
}

>
Clear Filters
</button>
</div>
</div>
)}

{searchType === "taxi" && (

<div className="search-filters" style={{ width: "100%", marginBottom: "24px" }}>
  <h3>Filter Results</h3>
  <div
className="form-row"
style={{
display: "flex",
flexWrap: "wrap",
gap: "1rem",
marginBottom: "12px",
}}
>
<div className="form-group">
<label>Min Price</label>
<input type="text" name="minPrice" value={filterBy.minPrice} onChange={handleChange} />
</div>

<div className="form-group">
  <label>Max Price</label>
  <input type="text" name="maxPrice" value={filterBy.maxPrice} onChange={handleChange} />
</div>

<div className="form-group">
<label>Min Time</label>
<select name="minTime" value={filterBy.minTime} onChange={handleChange}>
<option value="">Any</option>
<option value="5-10">5 - 10 minutes</option>
<option value="10-15">10 - 15 minutes</option>
<option value="15-20">15 - 20 minutes</option>
<option value="20-25">20 - 25 minutes</option>
</select>

</div>

<div className="form-group">
<label>Max Time</label>
<select name="maxTime" value={filterBy.maxTime} onChange={handleChange}>
<option value="">Any</option>
<option value="25-30">25 - 30 minutes</option>
<option value="30-35">30 - 35 minutes</option>
<option value="35-40">35 - 40 minutes</option>
<option value="40-45">40 - 45 minutes</option>
<option value="45-50">45 - 50 minutes</option>
<option value="50-55">50 - 55 minutes</option>
<option value="55-60">55 - 60 minutes</option>
<option value="60+">60+ minutes</option>
</select>
</div>

<div className="form-group">
<label>Min Driver Age</label>
<select name="minDriverAge" value={filterBy.minDriverAge} onChange={handleChange}>
<option value="">Any</option>
<option value="18-20">18 - 20 years</option>
<option value="20-25">20 - 25 years</option>
<option value="25-30">25 - 30 years</option>
</select>
</div>

<div className="form-group">
<label>Max Driver Age</label>
<select name="maxDriverAge" value={filterBy.maxDriverAge} onChange={handleChange}>
<option value="">Any</option>
<option value="30-35">30 - 35 years</option>
<option value="35-40">35 - 40 years</option>
<option value="40-45">40 - 45 years</option>
<option value="45-50">45 - 50 years</option>
<option value="50-55">50 - 55 years</option>
<option value="55-60">55 - 60 years</option>
<option value="60+">60+ years</option>
</select>
</div>

<div className="form-group">
<label>Min Distance</label>
<select name="minDistance" value={filterBy.minDistance} onChange={handleChange}>
<option value="">Any</option>
<option value="0.5-1">0.5 - 1 km</option>
<option value="1-1.5">1 - 1.5 km</option>
<option value="1.5-2">1.5 - 2 km</option>
<option value="2-2.5">2 - 2.5 km</option>
<option value="2.5-3">2.5 - 3 km</option>
</select>
</div>

<div className="form-group">
<label>Max Distance</label>
<select name="maxDistance" value={filterBy.maxDistance} onChange={handleChange}>
<option value="">Any</option>
<option value="3-4">3 - 4 km</option>
<option value="4-5">4 - 5 km</option>
<option value="5+">5+ km</option>
</select>
</div>

<div className="form-group">
<label>Rating</label>
<select name="minRating" value={filterBy.minRating} onChange={handleChange}>
<option value="">Any</option>
<option value="1">1 ★</option>
<option value="2">2 ★</option>
<option value="3">3 ★</option>
<option value="4">4 ★</option>
<option value="5">5 ★</option>
</select>
</div>
</div>



<div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
<button
className="btn btn-secondary"
style={{
padding: "8px 16px",
fontWeight: "bold",
borderRadius: "6px",
backgroundColor: "#ccc",
color: "#000",
border: "1px solid #999",
cursor: "pointer",
}}
onClick={() =>
setFilterBy((prev) => ({
...prev,
minPrice: "",
maxPrice: "",
airline: "",
stops: "",
}))
}

>
Clear Filters
</button>
</div>
</div>
)}





          </div>

          <div className="search-results-list">
            {filteredResults.length === 0 ? (
              <div className="no-results">
                <h3>No results found</h3>
                <p>Try adjusting your filters or search criteria.</p>
              </div>
            ) : (
              filteredResults.map((result) => (
                <div key={result.id} className="search-result-item">
                    {searchType === "hotel" && (
                      <div className="result-image">
                        <img src={getHotelImage(result)} alt={result.name} />
                      </div>
                    )}

                    {searchType === "taxi" && (
                      <div className="result-image">
                         <img src={getTaxiImage(result)} alt={result.name} />
                      </div>
                    )}

                    {searchType === "car" && (
                      <div className="result-image">
                        <img src={getCarImage(result)} alt={result.name} />
                      </div>
                    )}




                  <div className="result-content">
                    <div className="result-header">
                    <h4>
                       {searchType === "hotel" && (result.name || "Hotel")}
                       {searchType === "car" && (result.brand || result.carModel || "Car")}
                       {searchType === "taxi" && (result.carModel || result.company || "Taxi")}
                       {searchType === "flight" && (result.airline || result.name || "Flight")}
                    </h4>
                    </div>
                    {searchType === "hotel" && (
                     <div
                        className="hotel-info-row"
                        style={{
                         display: "flex",
                         flexWrap: "wrap",
                         gap: "10px",
                         marginTop: "8px",
                         fontSize: "14px",
                         color: "#444",
                        }}
                      >
                      <div><strong>City:</strong> {result.city}, {result.countery}</div>
                      <div><strong>Guests:</strong> {result.numberofPersons} guests</div>
                      <div><strong>Check-in:</strong> {new Date(result.checkInDate).toLocaleDateString()} - {new Date(result.checkOutDate).toLocaleDateString()}</div>
                      <div><strong>Rating:</strong> {result.rate} ★</div>
                      <div><strong>Facilities:</strong> {result.facility || "N/A"}</div>
                      <div><strong>Pool:</strong> {result.hasPool ? "Yes" : "No"}</div>
                      <div><strong>Gym:</strong> {result.hasGym ? "Yes" : "No"}</div>
                      <div><strong>Spa:</strong> {result.hasSpa ? "Yes" : "No"}</div>
                      <div><strong>Restaurant:</strong> {result.hasRestaurant ? "Yes" : "No"}</div>
                      <div><strong>Parking:</strong> {result.hasParking ? "Yes" : "No"}</div>
                      <div><strong>Wifi:</strong> {result.hasWifi ? "Yes" : "No"}</div>
                     </div>
                    )}


                    {result.pickUpLocation && (
                      <p className="result-location">📍 {result.pickUpLocation}</p>
                    )}
                    


                    <div className="result-details">
                      {searchType === "car" && (
                        <>
                          <p>Brand: {result.brand}</p>
                          <p>Car Type: {result.carType}</p>
                          <p>Transmission: {result.transmission}</p>
                          <p>Engine Type: {result.engineType}</p>
                          <p>Pick-up Location: {result.pickUpLocation}</p>
                          <p>Drop-off Location: {result.dropOffLocation}</p>
                          <p>Rent Type: {result.rentType}</p>
                        </>
                      )}

                      {searchType === "taxi" && (
                        <div
                          className="taxi-info-row"
                          style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "10px",
                          marginTop: "8px",
                          fontSize: "14px",
                          color: "#444",
                          }}
                        >
                        <div><strong>Pickup:</strong> {result.pickUpLocation || result.pickUplocaion}</div>
                        <div><strong>Drop-off:</strong> {result.dropOffLocation || result.dropoffLocation}</div>
                        {result.tripTime && (
                          <div><strong>Trip Time:</strong> {new Date(result.tripTime).toLocaleString()}</div>
                        )}
                        <div><strong>Driver Age:</strong> {result.driverAge}</div>
                        <div><strong>Distance:</strong> {result.distance} km</div>
                        <div><strong>Rating:</strong> {result.rate} ★</div>
                        <div><strong>Model:</strong> {result.carModel}</div>
                        <div><strong>Company:</strong> {result.company}</div>
                       </div>
                      )}



                    <div className="result-details">
                      {searchType === "flight" && (
                        <>
                          
                          <p> From: {result.fromLocation}</p>
                          <p> To: {result.destination}</p>
                          <p> Departure: {new Date(result.departureTime).toLocaleString()}</p>
                          <p> Arrival: {new Date(result.arrivalTime).toLocaleString()}</p>
                          <p> Stops: {result.stops}</p>
                          <p> Flight Class: {result.category}</p>
                          <p> Price: {result.price}</p>
                        </>
                      )}
                    </div>
                    </div>

                    <div className="result-actions">
                      <div className="result-price">
                        <span className="price-amount">
                          EGP {result.price?.toFixed(2)}
                        </span>
                        <span className="price-unit">
                          {searchType === "hotel" && "per night"}
                          {searchType === "car" && "per day"}
                          {searchType === "taxi" && "estimated"}
                        </span>
                      </div>
                      <div className="action-buttons">
                      <button
  className="btn"
  onClick={() => {
    if (searchType === "hotel") {
      handleHotelPayment(result);
    } else if (searchType === "taxi") {
      handleTaxiPayment(result);
    } else if (searchType === "car") {
      handleCarRentalPayment(result);
    } else if (searchType === "flight") {
      handleFlightPayment(result);
    }
  }}
>
  Book Now
</button>

                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
  )
}
