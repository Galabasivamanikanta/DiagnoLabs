import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, CheckCircle, XCircle, MapPin, 
    Globe, Shield, Building2, ExternalLink, Activity
} from 'lucide-react';

const LabVerification = () => {
    const [viewMode, setViewMode] = useState('discovery'); // 'discovery' or 'network'
    const [editingLab, setEditingLab] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', city: '', servicePincodes: '' });

    useEffect(() => {
        if (viewMode === 'discovery') fetchPendingLabs();
        else fetchVerifiedLabs();
    }, [viewMode]);

    const fetchPendingLabs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/labs/all-discovery`);
            setLabs(res.data);
        } catch (err) {
            console.error("Error fetching discovery labs:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVerifiedLabs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/labs`);
            setLabs(res.data);
        } catch (err) {
            console.error("Error fetching network labs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (labId) => {
        try {
            setProcessingId(labId);
            await axios.put(`${API_BASE_URL}/api/labs/${labId}`, { isVerified: true });
            setLabs(prev => prev.filter(l => l._id !== labId));
        } catch (err) {
            console.error("Verification failed:", err);
        } finally {
            setProcessingId(null);
        }
    };

    const handleEditStart = (lab) => {
        setEditingLab(lab);
        setEditForm({
            name: lab.name,
            city: lab.city,
            servicePincodes: lab.servicePincodes?.join(', ') || ''
        });
    };

    const handleUpdate = async () => {
        try {
            const updatedData = {
                ...editForm,
                servicePincodes: editForm.servicePincodes.split(',').map(p => p.trim()).filter(p => p)
            };
            await axios.put(`${API_BASE_URL}/api/labs/${editingLab._id}`, updatedData);
            
            setLabs(prev => prev.map(l => l._id === editingLab._id ? { ...l, ...updatedData } : l));
            setEditingLab(null);
        } catch (err) {
            console.error("Update failed:", err);
            alert("Failed to update clinical facility details");
        }
    };

    const handleDelete = async (labId) => {
        if (window.confirm("Permanently remove this facility from the DiagnoLabs network?")) {
            try {
                setProcessingId(labId);
                await axios.delete(`${API_BASE_URL}/api/labs/${labId}`);
                setLabs(prev => prev.filter(l => l._id !== labId));
            } catch (err) {
                console.error("Deletion failed:", err);
            } finally {
                setProcessingId(null);
            }
        }
    };

    const filteredLabs = labs.filter(lab => 
        lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="lab-verification-container">
            {/* Header / Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="admin-toggle-group">
                        <button 
                            className={`toggle-btn ${viewMode === 'discovery' ? 'active' : ''}`}
                            onClick={() => setViewMode('discovery')}
                        >
                            Clinical Discovery
                        </button>
                        <button 
                            className={`toggle-btn ${viewMode === 'network' ? 'active' : ''}`}
                            onClick={() => setViewMode('network')}
                        >
                            Active Network
                        </button>
                    </div>
                    <div className="panel-search-wrapper" style={{ width: '300px' }}>
                        <Search size={15} />
                        <input
                            type="text"
                            className="panel-search-input"
                            placeholder="Filter clinical partners..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', fontWeight: '600' }}>
                    {filteredLabs.length} {viewMode === 'discovery' ? 'pending auditing' : 'active partners'}
                </span>
            </div>

            {loading ? (
                <div className="admin-empty-state">
                    <div className="admin-empty-icon"><Activity size={32} /></div>
                    <h4>Synchronizing Global Registries...</h4>
                    <p>Scouring OpenStreetMap and Google for new clinical data</p>
                </div>
            ) : filteredLabs.length === 0 ? (
                <div className="admin-empty-state">
                    <div className="admin-empty-icon"><Globe size={32} /></div>
                    <h4>Network Fully Verified</h4>
                    <p>{searchQuery ? 'No pending matches for your search' : 'All discovered clinical facilities are currently authorized'}</p>
                </div>
            ) : (
                <div className="discovery-grid">
                    <AnimatePresence>
                        {filteredLabs.map((lab) => (
                            <motion.div 
                                key={lab._id} 
                                className="discovery-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <div className="discovery-card-header">
                                    <div className="discovery-icon">
                                        <Building2 size={20} />
                                    </div>
                                    <div className="discovery-main-info">
                                        <h4>{lab.name}</h4>
                                        <div className="discovery-meta">
                                            <span className="discovery-city"><MapPin size={10} /> {lab.city}</span>
                                            <span className="discovery-id">ID: {lab.googlePlaceId?.substring(0, 10)}...</span>
                                        </div>
                                    </div>
                                    <div className="discovery-source-badge">
                                        {lab.googlePlaceId?.startsWith('osm_') ? 'OSM' : 'Google'} Discovery
                                    </div>
                                </div>

                                <div className="discovery-card-body">
                                    <p className="discovery-address">{lab.address}</p>
                                </div>
                                <div className="discovery-stats">
                                    <div className="discovery-stat">
                                        <span className="label">Regions</span>
                                        <span className="value">{lab.servicePincodes?.length || 0} Areas</span>
                                    </div>
                                    <div className="discovery-stat">
                                        <span className="label">Rating</span>
                                        <span className="value">{lab.rating?.toFixed(1) || '4.2'} ★</span>
                                    </div>
                                    <div className="discovery-stat">
                                        <span className="label">Status</span>
                                        <span className="value">{lab.isVerified ? 'Partner ✅' : 'Discovery 🛡️'}</span>
                                    </div>
                                </div>

                                <div className="discovery-card-actions">
                                    {viewMode === 'discovery' && (
                                        <button 
                                            className="verify-btn" 
                                            disabled={processingId === lab._id}
                                            onClick={() => handleVerify(lab._id)}
                                        >
                                            <Shield size={14} /> Authorize
                                        </button>
                                    )}
                                    <button 
                                        className="edit-mini-btn"
                                        onClick={() => handleEditStart(lab)}
                                    >
                                        <ExternalLink size={14} /> Edit Areas
                                    </button>
                                    <button 
                                        className="reject-btn"
                                        disabled={processingId === lab._id}
                                        onClick={() => handleDelete(lab._id)}
                                    >
                                        <XCircle size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Editing Modal */}
            <AnimatePresence>
                {editingLab && (
                    <motion.div className="edit-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="edit-modal-content" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
                            <h3>Clinical Territory Management</h3>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Manual override for {editingLab.name}</p>
                            
                            <div className="edit-field">
                                <label>Clinical Name</label>
                                <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                            </div>
                            <div className="edit-field">
                                <label>Primary City</label>
                                <input value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                            </div>
                            <div className="edit-field">
                                <label>Service Pincodes (Area Enhancement)</label>
                                <textarea 
                                    rows="4" 
                                    value={editForm.servicePincodes} 
                                    onChange={e => setEditForm({...editForm, servicePincodes: e.target.value})} 
                                    placeholder="e.g. 500081, 500032, 500045"
                                />
                            </div>

                            <div className="edit-modal-actions">
                                <button className="cancel-btn" onClick={() => setEditingLab(null)}>Discard</button>
                                <button className="save-btn" onClick={handleUpdate}>Save Clinical Changes</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .admin-toggle-group {
                    display: flex;
                    background: rgba(255,255,255,0.05);
                    padding: 0.25rem;
                    border-radius: 12px;
                }
                .toggle-btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    background: transparent;
                    color: rgba(255,255,255,0.4);
                    font-size: 0.75rem;
                    font-weight: 700;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .toggle-btn.active {
                    background: var(--primary-blue);
                    color: white;
                }
                .discovery-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                }
                .discovery-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                }
                .discovery-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.15);
                    transform: translateY(-4px);
                }
                .discovery-card-header {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                    align-items: flex-start;
                }
                .discovery-icon {
                    width: 44px;
                    height: 44px;
                    background: rgba(var(--primary-rgb), 0.1);
                    color: var(--primary-blue);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .discovery-main-info h4 {
                    margin: 0 0 0.25rem 0;
                    font-size: 1rem;
                    font-weight: 700;
                    color: white;
                }
                .discovery-meta {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.4);
                }
                .discovery-city {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                .discovery-source-badge {
                    margin-left: auto;
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 0.25rem 0.5rem;
                    background: rgba(255,255,255,0.05);
                    border-radius: 6px;
                    color: rgba(255,255,255,0.3);
                    text-transform: uppercase;
                }
                .discovery-address {
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.6);
                    line-height: 1.4;
                    margin-bottom: 1.25rem;
                    min-height: 2.4rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .discovery-stats {
                    display: flex;
                    justify-content: space-between;
                    background: rgba(0,0,0,0.2);
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                }
                .discovery-stat {
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }
                .discovery-stat .label {
                    font-size: 0.65rem;
                    color: rgba(255,255,255,0.3);
                    text-transform: uppercase;
                    font-weight: 700;
                }
                .discovery-stat .value {
                    font-size: 0.85rem;
                    color: white;
                    font-weight: 700;
                }
                .discovery-card-actions {
                    display: flex;
                    gap: 0.75rem;
                }
                .verify-btn {
                    flex: 1.5;
                    padding: 0.75rem;
                    background: var(--primary-blue);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }
                .edit-mini-btn {
                    flex: 1;
                    padding: 0.75rem;
                    background: rgba(255,255,255,0.05);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }
                .reject-btn {
                    width: 44px;
                    height: 44px;
                    background: rgba(244, 63, 94, 0.1);
                    color: #fb7185;
                    border: 1px solid rgba(244, 63, 94, 0.2);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                /* Modal Styles */
                .edit-modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 2rem;
                }
                .edit-modal-content {
                    background: #111;
                    border: 1px solid rgba(255,255,255,0.1);
                    width: 100%;
                    max-width: 500px;
                    padding: 2.5rem;
                    border-radius: 28px;
                    box-shadow: 0 30px 60px -20px rgba(0,0,0,0.6);
                }
                .edit-field {
                    margin-bottom: 1.5rem;
                }
                .edit-field label {
                    display: block;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    font-weight: 800;
                    color: rgba(255,255,255,0.3);
                    margin-bottom: 0.5rem;
                    letter-spacing: 0.5px;
                }
                .edit-field input, .edit-field textarea {
                    width: 100%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 0.75rem 1rem;
                    color: white;
                    font-size: 0.9rem;
                    outline: none;
                }
                .edit-modal-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                }
                .cancel-btn {
                    flex: 1;
                    padding: 0.85rem;
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .save-btn {
                    flex: 2;
                    padding: 0.85rem;
                    background: var(--primary-blue);
                    border: none;
                    color: white;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default LabVerification;
