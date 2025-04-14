import { storeData, getData, STORAGE_KEYS } from '../utils/storageUtils';

/**
 * Fetch merchants from API or mock data
 * @param {Object} region - Map region with latitude, longitude
 * @returns {Promise<Array>} - Array of merchant objects
 */
export const fetchMerchants = async (region) => {
  try {
    // In a real app, this would be an API call
    // Example: 
    // const response = await fetch('https://api.waocard.com/merchants');
    // const data = await response.json();
    // return data;
    
    // For demo, use mock data
    const mockMerchants = generateMockMerchants(region);
    
    // Cache the data for offline use
    await storeData(STORAGE_KEYS.MERCHANTS, mockMerchants);
    
    return mockMerchants;
  } catch (error) {
    console.error('Error fetching merchants:', error);
    throw error;
  }
};

/**
 * Fetch merchants from local storage
 * @returns {Promise<Array>} - Array of cached merchant objects
 */
export const fetchCachedMerchants = async () => {
  try {
    const merchants = await getData(STORAGE_KEYS.MERCHANTS);
    return merchants || [];
  } catch (error) {
    console.error('Error fetching cached merchants:', error);
    return [];
  }
};

/**
 * Get merchant details by ID
 * @param {string} merchantId - Merchant ID
 * @returns {Promise<Object>} - Merchant details
 */
export const getMerchantDetails = async (merchantId) => {
  try {
    // In a real app, this would be an API call
    // const response = await fetch(`https://api.waocard.com/merchants/${merchantId}`);
    // const data = await response.json();
    // return data;
    
    // For demo, fetch from cache and enhance with mock detailed data
    const merchants = await fetchCachedMerchants();
    const merchant = merchants.find(m => m.id === merchantId);
    
    if (!merchant) {
      throw new Error('Merchant not found');
    }
    
    return {
      ...merchant,
      description: "This WaoCard-accepting merchant offers excellent products and services with a focus on customer satisfaction. They have been a trusted partner in the WaoCard network for over 2 years.",
      openingHours: "Mon-Fri: 9:00 AM - 6:00 PM\nSat: 10:00 AM - 4:00 PM\nSun: Closed",
      phone: "+234 123 456 7890",
      website: "https://example.com",
      images: [
        'https://example.com/merchant-1.jpg',
        'https://example.com/merchant-2.jpg',
        'https://example.com/merchant-3.jpg',
      ],
      waoCardDiscount: "10% off on all purchases with WaoCard",
      paymentOptions: ["WaoCard", "Visa", "Mastercard", "Cash"],
    };
  } catch (error) {
    console.error('Error getting merchant details:', error);
    throw error;
  }
};

/**
 * Generate mock merchants around a given region
 * @param {Object} region - Map region with latitude, longitude
 * @returns {Array} - Array of merchant objects
 */
const generateMockMerchants = (region) => {
  // Default to center of Nigeria if region is not provided
  const centerLat = region?.latitude || 9.0820;
  const centerLng = region?.longitude || 8.6753;
  
  const categories = ['food', 'retail', 'services', 'atm', 'fueling'];
  const merchants = [];
  
  // Generate 20 random merchants around the region
  for (let i = 1; i <= 20; i++) {
    // Generate random offset from center (within ~2-3 km)
    const latOffset = (Math.random() - 0.5) * 0.03;
    const lngOffset = (Math.random() - 0.5) * 0.03;
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const acceptsWaoCard = Math.random() > 0.2; // 80% chance of accepting WaoCard
    
    merchants.push({
      id: i.toString(),
      name: getMockMerchantName(category, i),
      category,
      acceptsWaoCard,
      rating: (3.5 + Math.random() * 1.5).toFixed(1), // Rating between 3.5 and 5.0
      coordinate: {
        latitude: centerLat + latOffset,
        longitude: centerLng + lngOffset,
      },
      address: generateMockAddress(),
      image: `https://example.com/merchant${i % 5 + 1}.jpg`
    });
  }
  
  return merchants;
};

/**
 * Generate a merchant name based on category
 * @param {string} category - Merchant category
 * @param {number} index - Index for uniqueness
 * @returns {string} - Generated merchant name
 */
const getMockMerchantName = (category, index) => {
  const prefixes = {
    food: ['Cafe', 'Restaurant', 'Bistro', 'Eatery', 'Diner'],
    retail: ['Shop', 'Store', 'Market', 'Boutique', 'Outlet'],
    services: ['Tech Hub', 'Business Center', 'Repair Shop', 'Agency', 'Studio'],
    atm: ['Bank', 'ATM', 'Financial Center', 'Banking Kiosk', 'Cash Point'],
    fueling: ['Fuel Station', 'Gas Stop', 'Petrol Station', 'Filling Station', 'Energy Hub']
  };
  
  const suffixes = {
    food: ['Delights', 'Kitchen', 'Flavors', 'Taste', 'Bites'],
    retail: ['Emporium', 'Mart', 'Bazaar', 'Corner', 'Hub'],
    services: ['Solutions', 'Pro', 'Express', 'Center', 'Zone'],
    atm: ['Express', '24/7', 'Direct', 'Quick', 'Access'],
    fueling: ['Plus', 'Express', 'Direct', '24/7', 'Quick']
  };
  
  const africaCities = ['Lagos', 'Nairobi', 'Accra', 'Johannesburg', 'Cairo', 'Kigali', 'Kampala', 'Dakar'];
  
  const prefix = prefixes[category][index % prefixes[category].length];
  const suffix = suffixes[category][Math.floor(Math.random() * suffixes[category].length)];
  const city = africaCities[Math.floor(Math.random() * africaCities.length)];
  
  return `${prefix} ${city} ${suffix}`;
};

/**
 * Generate a random mock address
 * @returns {string} - Generated address
 */
const generateMockAddress = () => {
  const streetNumbers = [1, 5, 10, 15, 22, 25, 30, 42, 55, 100];
  const streetNames = ['Main Street', 'Park Avenue', 'Market Road', 'Business Way', 'Central Drive', 'Commerce Street', 'Unity Road', 'Independence Avenue'];
  const cities = ['Lagos', 'Nairobi', 'Accra', 'Johannesburg', 'Cairo', 'Kigali', 'Kampala', 'Dakar'];
  
  const number = streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
  const street = streetNames[Math.floor(Math.random() * streetNames.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  
  return `${number} ${street}, ${city}`;
};