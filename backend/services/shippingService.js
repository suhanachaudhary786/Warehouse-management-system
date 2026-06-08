
const generateTrackingNumber = () => {
    const prefix = "TRK";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${timestamp}${random}`;
};

const generateShipmentNumber = () => {
    const prefix = "SHP";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
};

const carriers = {
    fedex: { name: "FedEx", apiEndpoint: "https://api.fedex.com", maxWeight: 150 },
    dhl: { name: "DHL", apiEndpoint: "https://api.dhl.com", maxWeight: 70 },
    ups: { name: "UPS", apiEndpoint: "https://api.ups.com", maxWeight: 150 },
    blue_dart: { name: "Blue Dart", apiEndpoint: "https://api.bluedart.com", maxWeight: 50 },
    delhivery: { name: "Delhivery", apiEndpoint: "https://api.delhivery.com", maxWeight: 100 },
};

const calculateShippingCost = (weight, carrier, serviceType) => {
    const baseRates = {
        fedex: { standard: 10, express: 20, overnight: 35, international: 50 },
        dhl: { standard: 12, express: 25, overnight: 40, international: 60 },
        ups: { standard: 11, express: 22, overnight: 38, international: 55 },
        blue_dart: { standard: 8, express: 18, overnight: 30, international: 45 },
        delhivery: { standard: 7, express: 15, overnight: 28, international: 40 },
    };

    const rate = baseRates[carrier]?.[serviceType] || 10;
    const weightCost = Math.ceil(weight / 5) * 5;
    return rate + weightCost;
};

module.exports = {
    generateTrackingNumber,
    generateShipmentNumber,
    carriers,
    calculateShippingCost,
};