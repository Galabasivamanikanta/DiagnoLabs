const envUrl = import.meta.env.VITE_API_URL;

let baseUrl;
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // In production web environment (Vercel), enforce Render backend URL!
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1') || envUrl.includes('vercel.app')) {
        baseUrl = 'https://diagnolabs-1qvc.onrender.com';
    } else {
        baseUrl = envUrl;
    }

} else {
    baseUrl = envUrl || 'http://127.0.0.1:5000';
}

// Clean trailing slash if present
baseUrl = baseUrl.replace(/\/$/, "");

export const API_BASE_URL = baseUrl;
console.log("DiagnoLabs Gateway Active:", API_BASE_URL);


