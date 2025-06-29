"use client"
const BASE_URL = "http://travella.runasp.net";
const paymentService = {
  createHotelCheckoutSession: (data) => {
    const token = localStorage.getItem("token");
    console.log("🪪 Token being sent:", token);
  
    return fetch(`${BASE_URL}/api/Payment/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    }).then(async (res) => {
      const text = await res.text();
      console.log("🪪 Raw response text:", text);
  
      try {
        const json = JSON.parse(text);
        return json;
      } catch (err) {
        console.error("❌ Failed to parse response JSON:", err);
        return { error: "Invalid response from server", raw: text };
      }
    });
  },
  
  
  
    createTaxiCheckoutSession: (data) => {
      const token = localStorage.getItem("token");
      return fetch(`${BASE_URL}/api/Payment/create-taxi-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());
    },
    
  
    createCarRentalCheckoutSession: (data) => {
      const token = localStorage.getItem("token");
      return fetch(`${BASE_URL}/api/Payment/create-carrental-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());
    },
    
    
  
    createFlightCheckoutSession: (data) => {
      const token = localStorage.getItem("token");
      return fetch(`${BASE_URL}/api/Payment/create-flight-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());
    },
  };
  export default paymentService;
  
  
  