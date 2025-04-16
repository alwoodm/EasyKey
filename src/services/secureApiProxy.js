/**
 * Secure API Proxy
 * 
 * This module provides a secure way to make API calls without exposing API keys to clients.
 * IMPORTANT: This is a client-side placeholder. For production, implement this as a server-side service.
 */

// Configuration for the secure API endpoint
const SECURE_API_ENDPOINT = process.env.REACT_APP_API_PROXY_ENDPOINT || '/api/proxy';

/**
 * Make a secure API call through a proxy
 * 
 * @param {string} endpoint - The API endpoint to call
 * @param {Object} data - The data to send with the request
 * @returns {Promise<Object>} The API response
 */
export const secureApiCall = async (endpoint, data) => {
  try {
    const response = await fetch(`${SECURE_API_ENDPOINT}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error making secure API call:", error);
    throw error;
  }
};

/**
 * Generate text securely through the API proxy
 * 
 * @param {Object} options - Options for text generation
 * @returns {Promise<string>} Generated text
 */
export const secureGenerateText = async (options) => {
  return secureApiCall('generate-text', options);
};

/**
 * Generate multiple text items securely through the API proxy
 * 
 * @param {Object} options - Options for text generation
 * @returns {Promise<string[]>} Array of generated text items
 */
export const secureGenerateMultiple = async (options) => {
  return secureApiCall('generate-multiple', options);
};
