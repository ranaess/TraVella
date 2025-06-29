import { authService } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://travella.runasp.net"

const handleResponse = async (response) => {
  if (response.status === 401) {
    authService.logout()
    throw new Error("Please log in to continue")
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `API error: ${response.status}`)
  }
  return response.json()
}

export const hotelService = {
  getAllHotels: async () => {
    const response = await fetch(`${API_BASE_URL}/api/Hotels/GetAllHotels`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  createHotel: async (hotelData) => {
    const response = await fetch(`${API_BASE_URL}/api/Hotels/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(hotelData),
    })
    return handleResponse(response)
  },

  getHotelDetails: async (hotelId) => {
    const response = await fetch(`${API_BASE_URL}/api/Hotels/${hotelId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  deleteHotel: async (hotelId) => {
    const response = await fetch(`${API_BASE_URL}/api/Hotels/${hotelId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  compareHotels: async (hotelId1, hotelId2) => {
    const response = await fetch(`${API_BASE_URL}/api/Hotels/compare/${hotelId1}/${hotelId2}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  addToFavourites: async (hotelId) => {
    const response = await fetch(`${API_BASE_URL}/api/Hotels/Favourite/${hotelId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  getFavourites: async () => {
    const response = await fetch(`${API_BASE_URL}/api/Hotels/Favourites`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  getSuggestions: async () => {
    const response = await fetch(`${API_BASE_URL}/api/Hotels/Suggestions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  searchHotels: async (searchParams) => {
    const allHotels = await hotelService.getAllHotels()
    let filteredHotels = allHotels

    if (searchParams.destination) {
      filteredHotels = filteredHotels.filter(
        (hotel) =>
          hotel.location?.toLowerCase().includes(searchParams.destination.toLowerCase()) ||
          hotel.city?.toLowerCase().includes(searchParams.destination.toLowerCase()) ||
          hotel.address?.toLowerCase().includes(searchParams.destination.toLowerCase()),
      )
    }

    if (searchParams.hotelType && searchParams.hotelType !== "any") {
      filteredHotels = filteredHotels.filter(
        (hotel) =>
          hotel.type?.toLowerCase() === searchParams.hotelType.toLowerCase() ||
          hotel.category?.toLowerCase() === searchParams.hotelType.toLowerCase(),
      )
    }

    if (searchParams.maxPrice) {
      filteredHotels = filteredHotels.filter(
        (hotel) => hotel.price <= searchParams.maxPrice || hotel.pricePerNight <= searchParams.maxPrice,
      )
    }

    if (searchParams.minRating) {
      filteredHotels = filteredHotels.filter((hotel) => hotel.rating >= searchParams.minRating)
    }

    return filteredHotels
  },

  bookHotel: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/api/Bookings/hotel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(bookingData),
    })
    return handleResponse(response)
  },

  searchHotelsViaAPI: async (searchParams) => {
    const response = await fetch(`${API_BASE_URL}/api/Hotels/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(searchParams),
    })
    return handleResponse(response)
  },

  getFilteredHotels: async () => {
    const response = await fetch(`${API_BASE_URL}/api/Hotels/Filter`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  getHotelDeals: async () => {
    const response = await fetch(`${API_BASE_URL}/api/Hotels/Deals`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  getTopRatedHotels: async () => {
    const response = await fetch(`${API_BASE_URL}/api/Hotels/TopRated`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  getHotelsNearByLocation: async () => {
    const response = await fetch(`${API_BASE_URL}/api/Hotels/NearByLocation`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

}

export const flightService = {
  createFlight: async (flightData) => {
    const response = await fetch(`${API_BASE_URL}/api/Flights/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(flightData),
    })
    return handleResponse(response)
  },

  getAllFlights: async () => {
    const response = await fetch(`${API_BASE_URL}/api/Flights`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  deleteFlight: async (flightId) => {
    const response = await fetch(`${API_BASE_URL}/api/Flights/${flightId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  filterFlights: async (filterParams) => {
    const response = await fetch(`${API_BASE_URL}/api/Flights/filter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(filterParams),
    })
    return handleResponse(response)
  },

  getFlightImage: async (imageName) => {
    const response = await fetch(`${API_BASE_URL}/api/Flights/image/${imageName}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return response.blob()
  },

  searchFlights: async (searchParams) => {
    const response = await fetch(`${API_BASE_URL}/api/Flights/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(searchParams),
    })
    return handleResponse(response)
  },

  getFlightDetails: async (flightId) => {
    const response = await fetch(`${API_BASE_URL}/api/Flights/${flightId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  bookFlight: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/api/Flights/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(bookingData),
    })
    return handleResponse(response)
  },
}

export const carService = {
  createCar: async (carData) => {
    const response = await fetch(`${API_BASE_URL}/api/CarRental/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(carData),
    })
    return handleResponse(response)
  },

  getAllCars: async () => {
    const response = await fetch(`${API_BASE_URL}/api/CarRental`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  getCarDetails: async (carId) => {
    const response = await fetch(`${API_BASE_URL}/api/CarRental/${carId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  deleteCar: async (carId) => {
    const response = await fetch(`${API_BASE_URL}/api/CarRental/${carId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  searchCars: async (searchParams) => {
    const response = await fetch(`${API_BASE_URL}/api/CarRental/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(searchParams),
    })
    return handleResponse(response)
  },

  filterCars: async (filterParams) => {
    const response = await fetch(`${API_BASE_URL}/api/CarRental/filter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(filterParams),
    })
    return handleResponse(response)
  },

  getAvailableCars: async () => {
    const response = await fetch(`${API_BASE_URL}/api/CarRental/available`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  getCarImage: async (imageName) => {
    const response = await fetch(`${API_BASE_URL}/api/CarRental/image/${imageName}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return response.blob()
  },

  bookCar: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/api/Bookings/car`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(bookingData),
    })
    return handleResponse(response)
  },
}

export const taxiService = {
  createTaxi: async (taxiData) => {
    const response = await fetch(`${API_BASE_URL}/api/Taxi/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(taxiData),
    })
    return handleResponse(response)
  },

  getAllTaxis: async () => {
    const response = await fetch(`${API_BASE_URL}/api/Taxi`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  getTaxiDetails: async (taxiId) => {
    const response = await fetch(`${API_BASE_URL}/api/Taxi/${taxiId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  deleteTaxi: async (taxiId) => {
    const response = await fetch(`${API_BASE_URL}/api/Taxi/${taxiId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  searchTaxis: async (searchParams) => {
    const response = await fetch(`${API_BASE_URL}/api/Taxi/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(searchParams),
    })
    return handleResponse(response)
  },

  filterTaxis: async (filterParams) => {
    const response = await fetch(`${API_BASE_URL}/api/Taxi/filter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(filterParams),
    })
    return handleResponse(response)
  },

  getAvailableTaxis: async () => {
    const response = await fetch(`${API_BASE_URL}/api/Taxi/available`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  getTaxiImage: async (imageName) => {
    const response = await fetch(`${API_BASE_URL}/api/Taxi/image/${imageName}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return response.blob()
  },

  bookTaxi: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/api/Bookings/taxi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(bookingData),
    })
    return handleResponse(response)
  },
}

export const budgetService = {
  predictBudget: async (tripDetails) => {
    const response = await fetch(`${API_BASE_URL}/api/Budget/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(tripDetails),
    })
    return handleResponse(response)
  },
}



export const bookingService = {
  bookHotel: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/api/Bookings/hotel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
      body: JSON.stringify(bookingData),
    })
    return handleResponse(response)
  },

  getAllBookings: async () => {
    const response = await fetch(`${API_BASE_URL}/api/Bookings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },
  

  getBookingById: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/api/Bookings/${bookingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  getActiveBookings: async () => {
    const response = await fetch(`${API_BASE_URL}/api/Bookings/active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  getCanceledBookings: async () => {
    const response = await fetch(`${API_BASE_URL}/api/Bookings/canceled`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  getPastBookings: async () => {
    const response = await fetch(`${API_BASE_URL}/api/Bookings/past`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },

  cancelBooking: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/api/Bookings/${bookingId}/cancel`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    })
    return handleResponse(response)
  },
}

const paymentService = {
  createHotelCheckoutSession: (data) =>
    fetch("/api/Payment/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json()),

  createTaxiCheckoutSession: (data) =>
    fetch("/api/Payment/create-taxi-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json()),

  createCarRentalCheckoutSession: (data) =>
    fetch("/api/Payment/create-carrental-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json()),

  createFlightCheckoutSession: (data) =>
    fetch("/api/Payment/create-flight-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json()),
};
export default paymentService;


