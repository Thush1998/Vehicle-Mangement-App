import { useState, useEffect } from 'react';
import {
    Shield,
    Clock,
    Upload,
    CheckCircle,
    Download,
    Calendar,
    Gauge,
    Plus
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Modal from './Modal';
import { useToast } from './Toast';

const DocumentCard = ({ type, expiryDate, onView }: any) => {
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const isExpired = daysLeft < 0;
    const isCritical = daysLeft < 30;

    return (
        <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                    padding: '10px',
                    borderRadius: '10px',
                    background: isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: isExpired ? 'var(--accent-danger)' : 'var(--accent-secondary)'
                }}>
                    <Shield size={20} />
                </div>
                <div className={`status-badge ${isExpired ? 'status-warning' : 'status-success'}`}>
                    {isExpired ? 'Expired' : 'Active'}
                </div>
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>{type}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                <Calendar size={14} /> Expires: {new Date(expiryDate).toLocaleDateString()}
            </div>

            <div style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--glass-border)',
                marginBottom: '16px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span>Validity Status</span>
                    <span style={{ color: isCritical ? 'var(--accent-danger)' : 'var(--accent-secondary)', fontWeight: 600 }}>
                        {isExpired ? 'Expired' : `${daysLeft} Days Left`}
                    </span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{
                        width: isExpired ? '0%' : `${Math.min(100, (daysLeft / 365) * 100)}%`,
                        background: isCritical ? 'var(--accent-danger)' : 'var(--accent-secondary)'
                    }}></div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={onView}
                    style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <Download size={14} /> View
                </button>
                <button style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                }}>
                    <Upload size={14} />
                </button>
            </div>
        </div>
    );
};

const VehicleDetails = ({ vehicleId }: { vehicleId: string }) => {
    const [vehicle, setVehicle] = useState<any>(null);
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const { showToast } = useToast();

    useEffect(() => {
        async function fetchDetails() {
            setLoading(true);
            const { data: vData } = await supabase.from('vehicles').select('*').eq('id', vehicleId).single();
            const { data: dData } = await supabase.from('documents').select('*').eq('vehicle_id', vehicleId);
            if (vData) setVehicle(vData);
            if (dData) setDocs(dData);
            setLoading(false);
        }
        fetchDetails();
    }, [vehicleId]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="spinner"></div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="glass-card" style={{ padding: '32px', display: 'flex', gap: '48px', alignItems: 'center' }}>
                <div style={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
                }}>
                    <img
                        src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=400"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px', opacity: 0.8 }}
                        alt="Vehicle"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>{vehicle?.name || '---'}</h2>
                    <div style={{ display: 'flex', gap: '24px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle size={18} color="var(--accent-secondary)" /> Reg: {vehicle?.plate_number || '---'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={18} color="var(--accent-primary)" /> Year: {vehicle?.year || '---'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Gauge size={18} color="var(--accent-primary)" /> Mileage: {vehicle?.last_odometer?.toLocaleString()} km
                        </div>
                    </div>
                    <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                        <button className="status-badge status-success" style={{ border: 'none', cursor: 'pointer' }}>Edit Profile</button>
                        <button className="status-badge" style={{ border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}>Export History</button>
                    </div>
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Digital Document Vault</h3>
                    <button style={{
                        padding: '10px 20px',
                        borderRadius: '12px',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center', gap: '8px'
                    }}>
                        <Plus size={18} /> Upload New Document
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                    {docs.map((doc, i) => (
                        <DocumentCard
                            key={i}
                            type={doc.type}
                            expiryDate={doc.expiry_date}
                            onView={() => { setSelectedDoc(doc); setShowPreview(true); }}
                        />
                    ))}
                    <div className="vault-item">
                        <Plus size={32} color="var(--text-secondary)" />
                        <span style={{ marginTop: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Add More Papers</span>
                    </div>
                </div>
            </div>
            {/* Modals */}
            <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title={`Preview: ${selectedDoc?.type}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{
                        width: '100%',
                        height: '300px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--glass-border)',
                        overflow: 'hidden'
                    }}>
                        {selectedDoc?.type === 'Revenue License' ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <Shield size={48} color="var(--accent-secondary)" style={{ marginBottom: '16px' }} />
                                <p style={{ fontWeight: 600 }}>Government Revenue License</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Valid until {new Date(selectedDoc.expiry_date).toLocaleDateString()}</p>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <Shield size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
                                <p style={{ fontWeight: 600 }}>Insurance Certificate</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status: Verified</p>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button onClick={() => setShowPreview(false)} style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer' }}>Close</button>
                        <button
                            className="btn-primary"
                            style={{ padding: '10px 20px' }}
                            onClick={() => showToast('Starting download...', 'success')}
                        >
                            Download PDF
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default VehicleDetails;
