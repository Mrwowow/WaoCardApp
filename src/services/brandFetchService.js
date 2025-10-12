/**
 * Brand Fetch Service
 * Handles auto-fetching brand data from WaoCard local API and external BrandFetch API
 */

const WAOCARD_API_BASE = 'https://waocard.co/api';
const BRANDFETCH_API_BASE = 'https://api.brandfetch.io/v2';
const BRANDFETCH_API_KEY = 'Bearer cgNOppxvLFeVvc6Bpkjd2cXwWCCgvKQ0kPeX6n9H74o=';
const BRANDFETCH_SEARCH_API_KEY = 'Bearer QO4sDIKgRSRy1PcN6OSRrV2lmbAAlgo24zU5zKT4aTA=';

/**
 * Search for brands using BrandFetch search API
 */
export const searchBrands = async (query) => {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const response = await fetch(`${BRANDFETCH_API_BASE}/search/${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Authorization': BRANDFETCH_SEARCH_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the response to match our expected format
    return data.map(brand => ({
      id: brand.brandId,
      name: brand.name,
      icon: brand.icon,
      domain: brand.domain,
    }));
  } catch (error) {
    console.error('Error searching brands:', error);
    return [];
  }
};

/**
 * Fetch brand data from WaoCard local API first, then BrandFetch API if not found
 */
export const fetchBrandData = async (domain) => {
  try {
    // First, try WaoCard local API
    const localData = await fetchFromWaoCardAPI(domain);
    
    if (localData && localData.status !== 'notfound') {
      console.log('Brand data found in WaoCard API:', localData);
      return processLogoData(localData);
    }

    // If not found locally, fetch from BrandFetch API
    console.log('Brand not found locally, fetching from BrandFetch API for domain:', domain);
    const externalData = await fetchFromBrandFetchAPI(domain);
    
    if (externalData) {
      // Save to WaoCard API for future use
      await saveBrandDataToWaoCard(externalData);
      return processLogoData(externalData);
    }

    return null;
  } catch (error) {
    console.error('Error fetching brand data:', error);
    return null;
  }
};

/**
 * Fetch brand data from WaoCard local API
 */
const fetchFromWaoCardAPI = async (domain) => {
  try {
    const response = await fetch(`${WAOCARD_API_BASE}/fetch_brand_data.php?domain=${encodeURIComponent(domain)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`WaoCard API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from WaoCard API:', error);
    return { status: 'notfound' };
  }
};

/**
 * Fetch brand data from external BrandFetch API
 */
const fetchFromBrandFetchAPI = async (domain) => {
  try {
    const response = await fetch(`${BRANDFETCH_API_BASE}/brands/${encodeURIComponent(domain)}`, {
      method: 'GET',
      headers: {
        'Authorization': BRANDFETCH_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`BrandFetch API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from BrandFetch API:', error);
    return null;
  }
};

/**
 * Save brand data to WaoCard API
 */
const saveBrandDataToWaoCard = async (brandData) => {
  try {
    const response = await fetch(`${WAOCARD_API_BASE}/brands_data.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(brandData),
    });

    if (response.ok) {
      console.log('Brand data saved to WaoCard API successfully');
    } else {
      console.warn('Failed to save brand data to WaoCard API:', response.status);
    }
  } catch (error) {
    console.error('Error saving brand data to WaoCard API:', error);
  }
};

/**
 * Process logo data to find the best logo format
 * Priority: SVG > PNG with transparent background > JPG/JPEG
 */
const processLogoData = (apiResponse) => {
  const result = {
    name: apiResponse.name || '',
    logo: null,
    colors: apiResponse.colors || [],
    domain: apiResponse.domain || '',
  };

  // Set default logo if no logos array
  if (!apiResponse.logos || !Array.isArray(apiResponse.logos)) {
    console.log('No logos array found in the API response');
    return result;
  }

  const logosArray = apiResponse.logos;

  // Find SVG format first
  const svgLogo = findLogoWithFormat(logosArray, 'svg');
  if (svgLogo) {
    const svgFormat = svgLogo.formats.find(format => format.format === 'svg');
    result.logo = svgFormat.src;
    console.log('Using SVG logo:', result.logo);
    return result;
  }

  // Find PNG with transparent background
  const pngLogo = findLogoWithPngTransparent(logosArray);
  if (pngLogo) {
    const pngFormat = pngLogo.formats.find(format => format.format === 'png' && format.background === 'transparent');
    result.logo = pngFormat.src;
    console.log('Using PNG logo with transparent background:', result.logo);
    return result;
  }

  // Find JPG/JPEG format
  const jpgLogo = findLogoWithFormat(logosArray, ['jpg', 'jpeg']);
  if (jpgLogo) {
    const jpgFormat = jpgLogo.formats.find(format => format.format === 'jpg' || format.format === 'jpeg');
    result.logo = jpgFormat.src;
    console.log('Using JPG/JPEG logo:', result.logo);
    return result;
  }

  console.log('No suitable logo format found');
  return result;
};

/**
 * Helper function to find logo with specific format
 */
const findLogoWithFormat = (logosArray, formats) => {
  const formatArray = Array.isArray(formats) ? formats : [formats];
  return logosArray.find(logo => {
    return logo.formats.some(format => formatArray.includes(format.format));
  });
};

/**
 * Helper function to find PNG logo with transparent background
 */
const findLogoWithPngTransparent = (logosArray) => {
  return logosArray.find(logo => {
    return logo.formats.some(format => format.format === 'png' && format.background === 'transparent');
  });
};

/**
 * Get brand colors for theming
 */
export const getBrandColors = (brandData) => {
  if (!brandData.colors || !Array.isArray(brandData.colors) || brandData.colors.length === 0) {
    return {
      backgroundColor: '#1e3c72',
      textColor: '#ffffff',
    };
  }

  const primaryColor = brandData.colors[0];
  return {
    backgroundColor: primaryColor.hex || '#1e3c72',
    textColor: primaryColor.type === 'dark' || primaryColor.type === 'accent' ? '#ffffff' : '#000000',
  };
};

export default {
  searchBrands,
  fetchBrandData,
  getBrandColors,
};