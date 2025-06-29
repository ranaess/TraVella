"use client"

export default function FinanceReport({
  budget,
  selectedServices,
  generalData,
  onBackToBudget,
  onStartNewCalculation,
}) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP",
    }).format(amount)
  }

  const getSelectedServicesText = () => {
    const services = []
    if (selectedServices.hotels) services.push("Hotels")
    if (selectedServices.flights) services.push("Flights")
    if (selectedServices.carRental) services.push("Car Rental")
    return services.join(", ")
  }

  const getReportTitle = () => {
    const serviceCount = [selectedServices.hotels, selectedServices.flights, selectedServices.carRental].filter(
      Boolean,
    ).length

    if (serviceCount === 1) {
      if (selectedServices.hotels) return "Hotel Budget Report"
      if (selectedServices.flights) return "Flight Budget Report"
      if (selectedServices.carRental) return "Car Rental Budget Report"
    } else if (serviceCount === 2) {
      if (selectedServices.hotels && selectedServices.flights) return "Hotels & Flights Budget Report"
      if (selectedServices.hotels && selectedServices.carRental) return "Hotels & Car Rental Budget Report"
      if (selectedServices.flights && selectedServices.carRental) return "Flights & Car Rental Budget Report"
    } else if (serviceCount === 3) {
      return "Complete Travel Budget Report"
    }

    return "Travel Budget Report"
  }

  const renderServiceBreakdown = () => {
    console.log("Breakdown in FinanceReport:", budget.breakdown)
    return budget.breakdown?.map((item) => {
      let description = "Estimated cost"
      if (item.type === "Hotel") {
        description = "Accommodation costs for your stay"
      } else if (item.type === "Flight") {
        description = "Flight tickets and related fees"
      } else if (item.type === "Car Rental") {
        description = "Vehicle rental"
      }
  
      return {
        name: item.type,
        amount: item.value,
        description,
      }
    }) || []
  }
  

  const calculateSelectedServicesTotal = () => {
    return budget.breakdown?.reduce((sum, item) => sum + (item.value || 0), 0) || 0
  }

  const selectedServicesTotal = calculateSelectedServicesTotal()
  const additionalCosts =
   (budget.food || 0) + (budget.activities || 0) + (budget.miscellaneous || 0)
  const grandTotal = selectedServicesTotal + additionalCosts


  
  return (
    <section className="finance-report">
      <div className="grand-total-amount">{formatCurrency(grandTotal)}</div>

      <div className="report-header">
        <h2 className="section-title"> {getReportTitle()}</h2>
        <div className="report-actions">
          <button type="button" className="btn secondary" onClick={onBackToBudget}>
            ← Back to Budget
          </button>
          <button type="button" className="btn" onClick={onStartNewCalculation}>
            New Calculation
          </button>
        </div>
      </div>

      <div className="report-content">

        <div className="report-section services-breakdown">
          <h3>Selected Services Breakdown</h3>
          <div className="breakdown-cards">
            {renderServiceBreakdown().map((item, index) => (
              <div key={index} className="breakdown-card">
                <div className="card-header">
                  <h4>{item.name}</h4>
                </div>
                <div className="card-amount">{formatCurrency(item.amount)}</div>
                <div className="card-description">{item.description}</div>
              </div>
            ))}
          </div>

          <div className="services-total">
            <div className="total-row">
              <span className="total-label">Total for Selected Services:</span>
              <span className="total-amount">{formatCurrency(selectedServicesTotal)}</span>
            </div>
          </div>
        </div>

        
        <div className="report-section grand-total-section">
          <div className="grand-total-card">
            <h3>Total Trip Budget</h3>
            <div className="grand-total-amount">{formatCurrency(grandTotal)}</div>
          </div>
        </div>

        <div className="report-actions-bottom">
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              const reportData = {
                title: getReportTitle(),
                destination: generalData.destination,
                duration: generalData.duration,
                travelers: generalData.travelers,
                services: getSelectedServicesText(),
                total: grandTotal,
              }
              navigator.clipboard.writeText(JSON.stringify(reportData, null, 2))
              alert("Report data copied to clipboard!")
            }}
          >
             Copy Data
          </button>
          <button type="button" className="btn" onClick={onStartNewCalculation}>
             New Calculation
          </button>
        </div>
      </div>
    </section>
  )
}
