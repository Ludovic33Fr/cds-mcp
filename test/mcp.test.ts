import { describe, it, expect } from 'vitest';  // Import Vitest testing functions (ESM)
import { getBestDeliveryInformations, searchByKeyword, getProductDetails } from '../src/mcp';  // Import the functions to test

// Integration tests for Cdiscount API functions (no HTTP mocks, real API calls).
// Each test uses a representative input and checks that the output contains expected keywords.
// Basic error handling ensures an API failure in one test doesn't stop the others.
describe('Cdiscount API integration tests (MCP functions)', () => {
  
  it('should retrieve best delivery information for a valid product ID', async () => {
    const testProductId = '9782075094504';  // Example product ID (EAN for a known product)
    let result: string;
    try {
      result = await getBestDeliveryInformations(testProductId);
    } catch (error) {
      console.error('Error in getBestDeliveryInformations API call:', error);
      // Fail this test if the API call threw an error (do not crash the entire test suite)
      expect.fail('getBestDeliveryInformations call failed – see error above');
      return;
    }
    // Verify the result is a non-empty string containing key substrings
    expect(typeof result).toBe('string');
    expect(result).not.toBe('');
    expect(result).toContain('Product ID');
    expect(result).toContain('Price');
  });

  it('should retrieve search results for a given keyword', async () => {
    const keyword = 'harry potter';  // Example keyword that should return multiple results
    let result: string;
    try {
      result = await searchByKeyword(keyword);
    } catch (error) {
      console.error('Error in searchByKeyword API call:', error);
      expect.fail('searchByKeyword call failed – see error above');
      return;
    }
    expect(typeof result).toBe('string');
    expect(result).not.toBe('');
    expect(result).toContain('Product ID');
    expect(result).toContain('Price');
  });

  it('should retrieve product details for a valid product ID', async () => {
    const testProductId = '9782075094504';  // Example product ID (EAN for a known product)
    let result: string;
    try {
      result = await getProductDetails(testProductId);
    } catch (error) {
      console.error('Error in getProductDetails API call:', error);
      expect.fail('getProductDetails call failed – see error above');
      return;
    }
    expect(typeof result).toBe('string');
    expect(result).not.toBe('');
    expect(result).toContain('Product ID');
    expect(result).toContain('Price');
  });

});
