import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus, Edit3, Trash2, X, Search, Shield, 
    Phone, Mail, User, Lock, ChevronDown
} from 'lucide-react';

const AVATAR_GRADIENTS = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #f43f5e, #fb7185)',
    'linear-gradient(135deg, #06b6d4, #22d3ee)',
    'linear-gradient(135deg, #8b5cf6, #c084fc)',
];

const getGradient = (name) => {
    if (!name) return AVATAR_GRADIENTS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'employee'
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/admin/employees`);
            setEmployees(res.data);
        } catch (err) {
            console.error("Error fetching employees:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await axios.put(`${API_BASE_URL}/api/admin/employees/${currentId}`, formData);
                alert("Employee updated successfully");
            } else {
                await axios.post(`${API_BASE_URL}/api/admin/employees`, formData);
                alert("Employee added successfully");
            }
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', phone: '', role: 'employee' });
            fetchEmployees();
        } catch (err) {
            console.error("Error saving employee:", err);
            alert("Error saving employee details");
        }
    };

    const handleEdit = (emp) => {
        setEditMode(true);
        setCurrentId(emp._id);
        setFormData({
            name: emp.name,
            email: emp.email,
            password: '',
            phone: emp.phone,
            role: emp.role
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            try {
                await axios.delete(`${API_BASE_URL}/api/admin/employees/${id}`);
                fetchEmployees();
            } catch (err) {
                console.error("Error deleting employee:", err);
            }
        }
    };

    const openCreateModal = () => {
        setEditMode(false);
        setFormData({ name: '', email: '', password: '', phone: '', role: 'employee' });
        setShowModal(true);
    };

    const filteredEmployees = employees.filter(emp => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return emp.name?.toLowerCase().includes(q) || emp.email?.toLowerCase().includes(q) || emp.phone?.includes(q);
    });

    const roleLabel = (role) => {
        if (role === 'admin') return 'Administrator';
        if (role === 'lab_partner') return 'Lab Partner';
        return 'Employee';
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="panel-search-wrapper">
                        <Search size={15} />
                        <input
                            type="text"
                            className="panel-search-input"
                            placeholder="Search employees..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', fontWeight: '600' }}>
                        {filteredEmployees.length} member{filteredEmployees.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <button className="add-employee-btn" onClick={openCreateModal}>
                    <UserPlus size={16} />
                    Add Employee
                </button>
            </div>

            {/* Employee Cards Grid */}
            {loading ? (
                <div className="admin-empty-state">
                    <div className="admin-empty-icon"><User size={32} /></div>
                    <h4>Loading employees...</h4>
                    <p>Synchronizing directory data</p>
                </div>
            ) : filteredEmployees.length === 0 ? (
                <div className="admin-empty-state">
                    <div className="admin-empty-icon"><User size={32} /></div>
                    <h4>{searchQuery ? 'No matches found' : 'No Employees Yet'}</h4>
                    <p>{searchQuery ? 'Try a different search term' : 'Add your first team member to get started'}</p>
                </div>
            ) : (
                <div className="employee-card-grid" style={{ padding: 0 }}>
                    <AnimatePresence>
                        {filteredEmployees.map((emp, index) => (
                            <motion.div
                                key={emp._id}
                                className="employee-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="employee-card-header">
                                    <div
                                        className="employee-avatar"
                                        style={{ background: getGradient(emp.name) }}
                                    >
                                        {getInitials(emp.name)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h5 className="employee-card-name">{emp.name}</h5>
                                        <p className="employee-card-email">{emp.email}</p>
                                    </div>
                                    <span className={`role-badge ${emp.role}`}>
                                        <Shield size={10} />
                                        {roleLabel(emp.role)}
                                    </span>
                                </div>

                                <div className="employee-card-details">
                                    <div className="employee-detail-item">
                                        <div className="employee-detail-label">Phone</div>
                                        <div className="employee-detail-value">{emp.phone || '—'}</div>
                                    </div>
                                    <div className="employee-detail-item">
                                        <div className="employee-detail-label">Security</div>
                                        <div className="employee-detail-value">••••••••</div>
                                    </div>
                                </div>

                                <div className="employee-card-actions">
                                    <button className="emp-action-btn edit" onClick={() => handleEdit(emp)}>
                                        <Edit3 size={14} /> Edit
                                    </button>
                                    <button className="emp-action-btn delete" onClick={() => handleDelete(emp._id)}>
                                        <Trash2 size={14} /> Remove
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                        <motion.div
                            className="admin-modal"
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.97 }}
                        >
                            <div className="admin-modal-header">
                                <div>
                                    <h3>{editMode ? 'Update Employee' : 'Add New Employee'}</h3>
                                    <p>{editMode ? 'Modify team member details' : 'Initialize access for a new team member'}</p>
                                </div>
                                <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="admin-modal-body">
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="admin-form-input"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter employee name"
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label className="admin-form-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="admin-form-input"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="employee@diagnoabs.com"
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">Phone Number</label>
                                            <input
                                                type="text"
                                                className="admin-form-input"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="+91 XXXXX XXXXX"
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-form-label">Network Role</label>
                                            <select
                                                className="admin-form-select"
                                                name="role"
                                                value={formData.role}
                                                onChange={handleInputChange}
                                            >
                                                <option value="employee">Employee</option>
                                                <option value="lab_partner">Lab Partner</option>
                                                <option value="admin">Administrator</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="admin-form-group">
                                        <label className="admin-form-label">
                                            {editMode ? 'New Password (optional)' : 'Security Password'}
                                        </label>
                                        <input
                                            type="password"
                                            className="admin-form-input"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required={!editMode}
                                            placeholder={editMode ? "Leave blank to keep current" : "Set a secure password"}
                                        />
                                    </div>
                                </div>

                                <div className="admin-modal-footer">
                                    <button type="button" className="modal-cancel-btn" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="modal-submit-btn">
                                        {editMode ? 'Update Details' : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeeManagement;
