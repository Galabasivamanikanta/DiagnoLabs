import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * Synchronize workspace actions (telemetry) to the AI engine for self-learning.
 * @param {string} eventType - The action type (e.g., "Prescription Saved", "Lab Report Verified")
 * @param {string} details - Specific details of the action (e.g., "Prescribed Metformin for High Glucose")
 * @param {string} role - The workspace role making the action (e.g., "doctor", "lab_technician")
 */
export const syncTelemetryToAI = async (eventType, details, role) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        await axios.post(`${API_BASE_URL}/api/chat/sync-event`, {
            eventType,
            details,
            role
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`[Telemetry] Synced event: ${eventType} to AI.`);
    } catch (err) {
        console.error("[Telemetry] Error syncing event to AI:", err.message);
    }
};
