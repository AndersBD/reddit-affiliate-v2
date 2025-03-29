import { describe, test, expect, vi, beforeEach } from 'vitest';
import { apiRequest, getQueryFn } from './queryClient';
import { server } from '../../vitest.setup';
import { http, HttpResponse } from 'msw';

// Mock global fetch
global.fetch = vi.fn();

describe('queryClient', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  describe('apiRequest', () => {
    test('should make a GET request with the right headers', async () => {
      // Setup mock response
      const mockResponse = { json: vi.fn().mockResolvedValue({ data: 'test' }) };
      (global.fetch as any).mockResolvedValue(mockResponse);
      
      // Call the function
      await apiRequest('GET', '/api/test');
      
      // Check the fetch call
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
    
    test('should include body for POST requests', async () => {
      // Setup mock response
      const mockResponse = { json: vi.fn().mockResolvedValue({ data: 'test' }) };
      (global.fetch as any).mockResolvedValue(mockResponse);
      
      const requestBody = { name: 'Test' };
      
      // Call the function
      await apiRequest('POST', '/api/test', requestBody);
      
      // Check the fetch call
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    });
    
    test('should throw error if response is not ok', async () => {
      // Setup mock response with error
      const errorResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: vi.fn().mockResolvedValue({ error: 'Resource not found' })
      };
      (global.fetch as any).mockResolvedValue(errorResponse);
      
      // Call the function and expect it to throw
      await expect(apiRequest('GET', '/api/not-found')).rejects.toThrow();
    });
  });
  
  describe('getQueryFn', () => {
    test('should generate a query function that calls apiRequest', async () => {
      // Setup MSW to intercept the request
      server.use(
        http.get('/api/test-query', () => {
          return HttpResponse.json({ success: true, data: 'test-data' });
        })
      );
      
      // Create a query function
      const queryFn = getQueryFn({ on401: 'throw' });
      
      // Call with mock query key
      const result = await queryFn({ queryKey: ['/api/test-query'] });
      
      // Verify result
      expect(result).toEqual({ success: true, data: 'test-data' });
    });
    
    test('should handle query params in the URL', async () => {
      // Setup spy on fetch
      const fetchSpy = vi.spyOn(global, 'fetch');
      
      // Set mock response
      const mockResponse = { 
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'test' }) 
      };
      fetchSpy.mockResolvedValue(mockResponse as any);
      
      // Create a query function
      const queryFn = getQueryFn({ on401: 'throw' });
      
      // Call with a query key that has params
      await queryFn({ queryKey: ['/api/test', { param1: 'value1', param2: 'value2' }] });
      
      // Verify URL had query params
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^\/api\/test\?param1=value1&param2=value2$/), 
        expect.any(Object)
      );
    });
  });
});