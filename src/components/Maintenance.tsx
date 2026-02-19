import { useState } from 'react';
import {
    Search,
    Tag,
    CircleDollarSign,
    Info,
    Mic,
    Plus,
    ArrowRight,
    TrendingUp,
    Fuel as FuelIcon
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Modal from './Modal';
import { useToast } from './Toast';
import { useEffect } from 'react';

const PartCard = ({ name, price, availability, image, category }: any) => (
    <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{
            height: '160px',
            background: `url(${image}) center/cover`,
            position: 'relative'
        }}>
            <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: availability === 'In Stock' ? '#10b981' : '#f59e0b',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                {availability}
            </div>
        </div>
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Tag size={12} /> {category}
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>{name}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CircleDollarSign size={16} color="var(--accent-secondary)" />
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{price}</span>
                </div>
                <button style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    cursor: 'pointer'
                }}>
                    <Info size={18} />
                </button>
            </div>
        </div>
    </div>
);

const Maintenance = () => {
    const [newOdometer, setNewOdometer] = useState('');
    const [fuelStation, setFuelStation] = useState('Ceypetco');
    const [isListening, setIsListening] = useState(false);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const { showToast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        service_type: 'Full Service',
        service_date: new Date().toISOString().split('T')[0],
        odometer_reading: '',
        labor_cost: '',
        parts_cost: '',
        notes: ''
    });

    const fetchLogs = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('maintenance_logs')
            .select('*')
            .order('service_date', { ascending: false });
        if (data) setLogs(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleUpdateOdometer = async () => {
        const odo = parseInt(newOdometer);
        if (!odo) {
            showToast('Enter a valid reading', 'error');
            return;
        }

        const { data: vehicle } = await supabase.from('vehicles').select('*').single();
        if (vehicle) {
            if (odo <= vehicle.last_odometer) {
                showToast('Must be higher than current', 'error');
                return;
            }

            const distance = odo - vehicle.last_odometer;
            await supabase.from('vehicles').update({ last_odometer: odo }).eq('id', vehicle.id);
            await supabase.from('trips').insert({
                vehicle_id: vehicle.id,
                distance: Math.max(0, distance),
                odometer_reading: odo,
                trip_date: new Date().toISOString()
            });

            setNewOdometer('');
            showToast('Trip logged successfully!', 'success');
            // Refresh logic: would be better with an event, but fetch here works
            fetchLogs();
        }
    };

    const handleAddRecord = async () => {
        if (!formData.odometer_reading || !formData.parts_cost) {
            showToast('Fill required fields', 'error');
            return;
        }

        try {
            const { data: vehicle } = await supabase.from('vehicles').select('*').single();
            const { error } = await supabase.from('maintenance_logs').insert([{
                ...formData,
                vehicle_id: vehicle.id,
                total_cost: Number(formData.labor_cost || 0) + Number(formData.parts_cost || 0)
            }]);

            if (error) throw error;

            showToast('Maintenance record saved!', 'success');
            setShowRecordModal(false);
            fetchLogs();
            setFormData({
                service_type: 'Full Service',
                service_date: new Date().toISOString().split('T')[0],
                odometer_reading: '',
                labor_cost: '',
                parts_cost: '',
                notes: ''
            });
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="spinner"></div>
            <style>{`
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(59, 130, 246, 0.1);
                    border-left-color: var(--accent-primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={20} color="var(--accent-primary)" /> Update Odometer
                    </h4>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <input
                            type="number"
                            placeholder="Current km..."
                            value={newOdometer}
                            onChange={(e) => setNewOdometer(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                padding: '10px',
                                borderRadius: '8px',
                                color: 'white'
                            }}
                        />
                        <button
                            onClick={handleUpdateOdometer}
                            style={{
                                background: 'var(--accent-primary)',
                                border: 'none',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                    <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FuelIcon size={20} color="var(--accent-secondary)" /> Fuel Quality
                    </h4>
                    <select
                        value={fuelStation}
                        onChange={(e) => setFuelStation(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            padding: '10px',
                            borderRadius: '8px',
                            color: 'white'
                        }}
                    >
                        <option value="Ceypetco">Ceypetco</option>
                        <option value="IOC">Lanka IOC</option>
                        <option value="Sinopec">Sinopec</option>
                    </select>
                </div>

                <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button
                        onClick={() => setIsListening(!isListening)}
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: isListening ? 'var(--accent-danger)' : 'rgba(59, 130, 246, 0.1)',
                            border: 'none',
                            color: isListening ? 'white' : 'var(--accent-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            boxShadow: isListening ? '0 0 20px var(--accent-danger)' : 'none'
                        }}
                    >
                        <Mic size={32} />
                    </button>
                    <div style={{ marginLeft: '16px' }}>
                        <p style={{ fontWeight: 600 }}>{isListening ? 'Listening...' : 'Voice Log'}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Click to speak command</p>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Maintenance & Service History</h3>
                    <button
                        onClick={() => setShowRecordModal(true)}
                        className="btn-primary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                        }}
                    >
                        <Plus size={18} /> Add New Record
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Service Type</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Date</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Mileage</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Labor Cost</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Parts Cost</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Total</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '16px', fontWeight: 600 }}>{item.service_type}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                                        {new Date(item.service_date).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px' }}>{item.odometer_reading?.toLocaleString()} km</td>
                                    <td style={{ padding: '16px' }}>{item.labor_cost?.toLocaleString()}</td>
                                    <td style={{ padding: '16px' }}>{item.parts_cost?.toLocaleString()}</td>
                                    <td style={{ padding: '16px', color: 'var(--accent-secondary)', fontWeight: 700 }}>
                                        {(item.total_cost || 0).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <button
                                            onClick={() => { setSelectedLog(item); setShowDetailModal(true); }}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No service records found. Start by adding one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Parts & Accessories Catalog</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search parts..."
                            style={{
                                padding: '10px 16px 10px 40px',
                                borderRadius: '12px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--glass-border)',
                                color: 'white',
                                width: '240px'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                <PartCard
                    name="Mobil 1 Synthetic Oil (5L)"
                    price="LKR 18,500"
                    availability="In Stock"
                    category="Fluid"
                    image="https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80&w=800"
                />
                <PartCard
                    name="Brembo Brake Pads"
                    price="LKR 22,000"
                    availability="Low Stock"
                    category="Braking"
                    image="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800"
                />
                <PartCard
                    name="Michelin Pilot Sport 4S"
                    price="LKR 65,000"
                    availability="In Stock"
                    category="Tires"
                    image="https://images.unsplash.com/photo-1578844541735-373970729792?auto=format&fit=crop&q=80&w=800"
                />
            </div>
            {/* Modals */}
            <Modal isOpen={showRecordModal} onClose={() => setShowRecordModal(false)} title="New Maintenance Record">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label className="input-label">Service Type</label>
                            <select
                                value={formData.service_type}
                                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                                className="glass-input"
                            >
                                <option value="Full Service">Full Service</option>
                                <option value="Engine Oil Change">Engine Oil Change</option>
                                <option value="Brake Pad Replacement">Brake Pad Replacement</option>
                                <option value="Tire Rotation">Tire Rotation</option>
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Date</label>
                            <input
                                type="date"
                                value={formData.service_date}
                                onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                                className="glass-input"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Odometer (km)</label>
                        <input
                            type="number"
                            value={formData.odometer_reading}
                            onChange={(e) => setFormData({ ...formData, odometer_reading: e.target.value })}
                            placeholder="Reading at service..."
                            className="glass-input"
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label className="input-label">Labor Cost (LKR)</label>
                            <input
                                type="number"
                                value={formData.labor_cost}
                                onChange={(e) => setFormData({ ...formData, labor_cost: e.target.value })}
                                placeholder="0"
                                className="glass-input"
                            />
                        </div>
                        <div>
                            <label className="input-label">Parts Cost (LKR)</label>
                            <input
                                type="number"
                                value={formData.parts_cost}
                                onChange={(e) => setFormData({ ...formData, parts_cost: e.target.value })}
                                placeholder="0"
                                className="glass-input"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Bill details, workshop name..."
                            className="glass-input"
                            style={{ minHeight: '80px', resize: 'none' }}
                        />
                    </div>
                    <button onClick={handleAddRecord} className="btn-primary" style={{ padding: '14px', marginTop: '8px' }}>
                        Save Record
                    </button>
                </div>
            </Modal>

            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Service Detail">
                {selectedLog && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
                            <div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Type</p>
                                <p style={{ fontWeight: 700 }}>{selectedLog.service_type}</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Date</p>
                                <p style={{ fontWeight: 700 }}>{new Date(selectedLog.service_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Mileage</p>
                                <p style={{ fontWeight: 700 }}>{selectedLog.odometer_reading?.toLocaleString()} km</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Cost</p>
                                <p style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>LKR {selectedLog.total_cost?.toLocaleString()}</p>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Notes & Bills</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                {selectedLog.notes || 'No detailed notes provided for this service entry.'}
                            </p>
                        </div>
                        <div style={{
                            height: '140px',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px dashed var(--glass-border)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.85rem'
                        }}>
                            Receipt attachment preview (Coming Soon)
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Maintenance;
