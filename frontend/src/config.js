// Deployment-Ready Configuration
// Use VITE_API_URL from environment variables if available (for production)
// Otherwise, fallback to local network discovery logic
const envUrl = import.meta.env.VITE_API_URL;

let baseUrl;
if (envUrl) {
    baseUrl = envUrl;
} else {
    const hostname = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
    const protocol = window.location.protocol;
    baseUrl = `${protocol}//${hostname}:5000`;
}

export const API_BASE_URL = baseUrl;
console.log("DiagnoLabs Gateway Active:", API_BASE_URL);
