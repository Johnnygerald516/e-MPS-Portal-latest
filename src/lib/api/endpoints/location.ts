// import axios from 'axios';

// // Create custom axios instance for location endpoints
// const createLocationApi = () => {
//   const api = axios.create({
//     baseURL: process.env.NEXT_PUBLIC_API_URL || '',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
  
//   // Add API key and authorization token to headers
//   const apiKey = process.env.NEXT_PUBLIC_API_KEY;
//   const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
//   const headers: Record<string, string> = {};
  
//   if (apiKey) {
//     headers['api-key'] = apiKey;
//   }
  
//   if (token) {
//     headers['Authorization'] = `Bearer ${token}`;
//   }
  
//   return { api, headers };
// };

// // Location endpoints
// export const locationEndpoints = {
//   // Get territories
//   getTerritories: async () => {
//     try {
//       const { api, headers } = createLocationApi();
//       const response = await api.get('/backend/address/location?level=Territory', { headers });
//       console.log('Territories response:', response);
//       // Ensure we return an array even if data is undefined
//       return {
//         data: response.data && response.data.data ? response.data.data : []
//       };
//     } catch (error) {
//       console.error('Error fetching territories:', error);
//       // Return empty array on error
//       return { data: [] };
//     }
//   },
  
//   // Get regions by territory ID
//   getRegionsByTerritory: async (territoryId: string) => {
//     try {
//       const { api, headers } = createLocationApi();
//       const response = await api.get(`/backend/address/location?level=Region&parentId=${territoryId}`, { headers });
//       console.log('Regions response:', response.data);
//       // Ensure we return an array even if data is undefined
//       return response.data && response.data.data ? response.data.data : [];
//     } catch (error) {
//       console.error('Error fetching regions:', error);
//       // Return empty array on error
//       return [];
//     }
//   },
  
//   // Get districts by region ID
//   getDistrictsByRegion: async (regionId: string) => {
//     try {
//       const { api, headers } = createLocationApi();
//       const response = await api.get(`/backend/address/location?level=District&parentId=${regionId}`, { headers });
//       console.log('Districts response:', response.data);
//       // Ensure we return an array even if data is undefined
//       return response.data && response.data.data ? response.data.data : [];
//     } catch (error) {
//       console.error('Error fetching districts:', error);
//       // Return empty array on error
//       return [];
//     }
//   },
  
//   // Get wards by district ID
//   getWardsByDistrict: async (districtId: string) => {
//     try {
//       const { api, headers } = createLocationApi();
//       const response = await api.get(`/backend/address/location?level=Ward&parentId=${districtId}`, { headers });
//       console.log('Wards response:', response.data);
//       // Ensure we return an array even if data is undefined
//       return response.data && response.data.data ? response.data.data : [];
//     } catch (error) {
//       console.error('Error fetching wards:', error);
//       // Return empty array on error
//       return [];
//     }
//   },
  
//   // Get address information by location IDs
//   getAddressByLocationIds: async (territoryId: string, regionId: string, districtId: string, wardId: string) => {
//     try {
//       const { api, headers } = createLocationApi();
//       const response = await api.get(`/backend/address/location/details`, {
//         headers,
//         params: {
//           territoryId,
//           regionId,
//           districtId,
//           wardId
//         }
//       });
//       // Ensure we return an array or object even if data is undefined
//       return response.data && response.data.data ? response.data.data : {};
//     } catch (error) {
//       console.error('Error fetching address details:', error);
//       // Return empty object on error to prevent length access on undefined
//       return {};
//     }
//   }
// };

import axios from 'axios';

// Create a single Axios instance with interceptors for automatic headers
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors to inject headers before each request
api.interceptors.request.use((config) => {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  if (apiKey) {
    config.headers['api-key'] = apiKey;
  }

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

const safeData = <T>(response: any): T | [] | {} => {
  return response?.data?.data ?? Array.isArray(response?.data?.data) ? [] : {};
};

// Location endpoints
export const locationEndpoints = {
  // Get territories
 getTerritories: async () => {
  try {
    const response = await api.get('/backend/address/location', {
      params: { level: 'Territory' },
    });
    console.log('Territories response:', response.data);
    return response.data?.data ?? []; // Return only the array
  } catch (error) {
    console.error('Error fetching territories:', error);
    return [];
  }
},

  // Get regions by territory ID
  getRegionsByTerritory: async (territoryId: string) => {
    try {
      const response = await api.get('/backend/address/location', {
        params: { level: 'Region', parentId: territoryId },
      });
      console.log('Regions response:', response.data);
      // return safeData(response);
      return response.data?.data ?? [];
    } catch (error) {
      console.error('Error fetching regions:', error);
      return [];
    }
  },

  // Get districts by region ID
  getDistrictsByRegion: async (regionId: string) => {
    try {
      const response = await api.get('/backend/address/location', {
        params: { level: 'District', parentId: regionId },
      });
      console.log('Districts response:', response.data);
      //return safeData(response);
      return response.data?.data ?? []
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  },

  // Get wards by district ID
  getWardsByDistrict: async (districtId: string) => {
    try {
      const response = await api.get('/backend/address/location', {
        params: { level: 'Ward', parentId: districtId },
      });
      console.log('Wards response:', response.data);
      //return safeData(response);
       return response.data?.data ?? []
    } catch (error) {
      console.error('Error fetching wards:', error);
      return [];
    }
  },

  // Get address information by location IDs
  getAddressByLocationIds: async (
    territoryId: string,
    regionId: string,
    districtId: string,
    wardId: string
  ) => {
    try {
      const response = await api.get('/backend/address/location/details', {
        params: {
          territoryId,
          regionId,
          districtId,
          wardId,
        },
      });
      console.log('Address details response:', response.data);
      //return safeData(response);
       return response.data?.data ?? []
    } catch (error) {
      console.error('Error fetching address details:', error);
      return {};
    }
  },
};

