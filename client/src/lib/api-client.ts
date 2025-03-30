/**
 * API client utility for making fetch requests
 */

const API_BASE_URL = '';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  queryParams?: Record<string, string>;
};

/**
 * Handles API requests with proper error handling and response parsing
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    queryParams = {},
  } = options;

  // Build URL with query parameters
  const url = new URL(
    endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`,
    window.location.origin
  );
  
  // Add query parameters
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  // Configure the fetch request
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    credentials: 'same-origin',
  };

  // Add the body for non-GET requests
  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url.toString(), fetchOptions);

    // Check if the response is valid JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle API errors
    if (!response.ok) {
      const error = new Error(
        typeof data === 'string'
          ? data
          : data.message || data.error || 'API request failed'
      );
      // @ts-ignore
      error.status = response.status;
      // @ts-ignore
      error.response = data;
      throw error;
    }

    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * API client with methods for common HTTP verbs
 */
export const apiClient = {
  get: <T = any>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) => 
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T = any>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) => 
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),
    
  put: <T = any>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) => 
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),
    
  patch: <T = any>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) => 
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),
    
  delete: <T = any>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}) => 
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};