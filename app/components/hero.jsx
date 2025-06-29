"use client"

export default function Hero({ setActiveSection }) {
  const services = [
    {
      id: "hotels",
      title: "Book Hotels",
      description: "Find and book the perfect accommodation for your stay",
    },
    {
      id: "flights",
      title: "Flight Tickets",
      description: "Search and book flights to your dream destination",
    },
    {
      id: "cars",
      title: "Car Rental",
      description: "Rent a car for convenient transportation",
    },
    {
      id: "taxis",
      title: "Taxi Booking",
      description: "Book taxis for quick and easy rides",
    },
  ]

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Your Ultimate Travel Companion</h1>
        <p>Book hotels, flights, cars, and taxis all in one place.</p>

        <div className="hero-services">
          {services.map((service) => (
            <div key={service.id} className="service-card" onClick={() => setActiveSection(service.id)}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
