import { useState, useEffect } from 'react';
import { Plus, Car, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Modal from './Modal';
import { useToast } from './Toast';

interface GarageProps {
    onSelect: (id: string) => void;
    selectedId?: string | null;
}

const Garage = ({ onSelect, selectedId }: GarageProps) => {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        plate_number: '',
        model: '',
        year: new Date().getFullYear().toString()
    });

    const fetchVehicles = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            showToast(error.message, 'error');
        } else {
            setVehicles(data || []);
            // Auto-select first vehicle if none selected
            if (!selectedId && data && data.length > 0) {
                onSelect(data[0].id);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleAddVehicle = async () => {
        if (!formData.name || !formData.plate_number) {
            showToast('Name and Plate Number are required', 'error');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('vehicles')
                .insert([{
                    name: formData.name,
                    plate_number: formData.plate_number,
                    model: formData.model,
                    year: parseInt(formData.year),
                    last_odometer: 0,
                    oil_last_service: 0,
                    brake_last_service: 0
                }])
                .select();

            if (error) throw error;

            showToast('Vehicle added to garage!', 'success');
            setShowAddModal(false);
            setFormData({ name: '', plate_number: '', model: '', year: new Date().getFullYear().toString() });
            fetchVehicles();
            if (data && data.length > 0) onSelect(data[0].id);
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="spinner"></div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>My Garage</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Select a vehicle to manage its health and logs.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={18} /> Add New Vehicle
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {vehicles.map((v) => (
                    <div
                        key={v.id}
                        className="glass-card"
                        style={{
                            padding: '24px',
                            cursor: 'pointer',
                            border: selectedId === v.id ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            transform: selectedId === v.id ? 'translateY(-4px)' : 'none',
                            boxShadow: selectedId === v.id ? '0 12px 24px rgba(59, 130, 246, 0.2)' : 'none'
                        }}
                        onClick={() => onSelect(v.id)}
                    >
                        {selectedId === v.id && (
                            <div style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                color: 'var(--accent-primary)'
                            }}>
                                <CheckCircle2 size={24} fill="var(--bg-card)" />
                            </div>
                        )}
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: 'var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px'
                        }}>
                            <Car size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>{v.name}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>{v.model} • {v.year}</p>

                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem' }}>
                            <div className="status-badge" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)' }}>
                                {v.plate_number}
                            </div>
                            <div className="status-badge status-success">
                                {v.last_odometer.toLocaleString()} km
                            </div>
                        </div>
                    </div>
                ))}

                {vehicles.length === 0 && (
                    <div
                        className="glass-card"
                        style={{
                            padding: '48px',
                            textAlign: 'center',
                            gridColumn: '1 / -1',
                            border: '2px dashed var(--glass-border)',
                            background: 'transparent'
                        }}
                    >
                        <LayoutGrid size={48} color="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <h3 style={{ color: 'var(--text-secondary)' }}>Your garage is empty</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Add your first vehicle to start tracking.</p>
                        <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => setShowAddModal(true)}>
                            Add Your First Vehicle
                        </button>
                    </div>
                )}
            </div>

            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Vehicle">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label className="input-label">Vehicle Name (e.g. My Civic)</label>
                        <input
                            className="glass-input"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter name..."
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label className="input-label">Plate Number</label>
                            <input
                                className="glass-input"
                                value={formData.plate_number}
                                onChange={e => setFormData({ ...formData, plate_number: e.target.value })}
                                placeholder="ABC-1234"
                            />
                        </div>
                        <div>
                            <label className="input-label">Year</label>
                            <input
                                type="number"
                                className="glass-input"
                                value={formData.year}
                                onChange={e => setFormData({ ...formData, year: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Model</label>
                        <input
                            className="glass-input"
                            value={formData.model}
                            onChange={e => setFormData({ ...formData, model: e.target.value })}
                            placeholder="e.g. Honda Civic"
                        />
                    </div>
                    <button className="btn-primary" style={{ marginTop: '12px', padding: '14px' }} onClick={handleAddVehicle}>
                        Register Vehicle
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Garage;
