export const aiPredictionService = {
    predictHotel: async (hotelBody) => {
      const response = await fetch("https://my-api-service-487381667778.europe-north1.run.app/Hotel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hotelBody),
      })
      return response.json()
    },
  
    predictCarRental: async (carBody) => {
      const response = await fetch("https://car-rental-api-22797554089.europe-north1.run.app/car_rental", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(carBody),
      })
      return response.json()
    },
  
    predictFlight: async (flightBody) => {
      const response = await fetch("https://flight-api-service-285212035997.europe-north1.run.app/Flight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flightBody),
      })
      return response.json()
    },
  }
  