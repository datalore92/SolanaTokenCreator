// Basic polyfills for crypto API needed by Solana web3.js
import { Buffer } from 'buffer';

// Ensure Buffer is available globally
window.Buffer = Buffer;

// Simple polyfill for crypto.getRandomValues
export const getRandomValues = (buffer) => {
  return window.crypto.getRandomValues(buffer);
};

// Simple implementation for randomBytes used by Solana libraries
export const randomBytes = (length) => {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array;
};

// Export a default object for named imports
export default {
  getRandomValues,
  randomBytes
};