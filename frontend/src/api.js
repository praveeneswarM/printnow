import axios from 'axios';

// When running in Production (Docker/K8s), Nginx proxies /api directly to the microservices.
// When running locally, Vite proxies /api.
// const SERVICES = {
//   USER: 'http://user-service:5001/api',
//   DOCUMENT: 'http://document-service:5002/api/documents',
//   ORDER: 'http://order-service:5003/api/orders',
//   VENDOR: 'http://vendor-service:5004/api/vendors',
// };
const SERVICES = {
  USER: '/api/auth',
  DOCUMENT: '/api/documents',
  ORDER: '/api/orders',
  VENDOR: '/api/vendors',
};

const createApiClient = (baseURL) => {
  const client = axios.create({ baseURL });
  client.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return client;
};

export const apiUser = createApiClient(SERVICES.USER);
export const apiDoc = createApiClient(SERVICES.DOCUMENT);
export const apiOrder = createApiClient(SERVICES.ORDER);
export const apiVendor = createApiClient(SERVICES.VENDOR);