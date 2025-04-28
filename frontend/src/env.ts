// Expose environment variables to the window object
declare global {
  interface Window {
    ENV: {
      VITE_API_BASE_URL?: string;
    };
  }
}

// Set environment variables on window object
window.ENV = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
};
