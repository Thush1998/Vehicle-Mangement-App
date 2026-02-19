import { useState, useEffect } from 'react';
import { Plus, Car, LayoutGrid, CheckCircle2, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
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
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const { showToast } = useToast();
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        plate_number: '',
        model: '',
        year: new Date().getFullYear().toString(),
        image_url: ''
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) {
                return;
            }

            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('vehicle-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('vehicle-images')
                .getPublicUrl(filePath);

            setFormData({ ...formData, image_url: publicUrl });
            showToast('Image uploaded successfully!', 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setUploading(false);
        }
    };

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

    const resetForm = () => {
        setFormData({
            name: '',
            plate_number: '',
            model: '',
            year: new Date().getFullYear().toString(),
            image_url: ''
        });
        setIsEditing(false);
        setEditId(null);
    };

    const handleOpenAdd = () => {
        resetForm();
        setShowModal(true);
    };

    const handleOpenEdit = (e: React.MouseEvent, vehicle: any) => {
        e.stopPropagation();
        setFormData({
            name: vehicle.name,
            plate_number: vehicle.plate_number,
            model: vehicle.model || '',
            year: vehicle.year?.toString() || new Date().getFullYear().toString(),
            image_url: vehicle.image_url || ''
        });
        setIsEditing(true);
        setEditId(vehicle.id);
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.plate_number) {
            showToast('Name and Plate Number are required', 'error');
            return;
        }

        try {
            if (isEditing && editId) {
                const { error } = await supabase
                    .from('vehicles')
                    .update({
                        name: formData.name,
                        plate_number: formData.plate_number,
                        model: formData.model,
                        year: parseInt(formData.year),
                        image_url: formData.image_url
                    })
                    .eq('id', editId);

                if (error) throw error;
                showToast('Vehicle updated successfully!', 'success');
            } else {
                const { data, error } = await supabase
                    .from('vehicles')
                    .insert([{
                        name: formData.name,
                        plate_number: formData.plate_number,
                        model: formData.model,
                        year: parseInt(formData.year),
                        image_url: formData.image_url,
                        last_odometer: 0,
                        oil_last_service: 0,
                        brake_last_service: 0
                    }])
                    .select();

                if (error) throw error;
                showToast('Vehicle added to garage!', 'success');
                if (data && data.length > 0) onSelect(data[0].id);
            }

            setShowModal(false);
            resetForm();
            fetchVehicles();
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to remove this vehicle? All related logs will be kept in database but hidden from this vehicle view.')) return;

        try {
            // Note: In a real app we might want to cascade or handle orphans. 
            // For now we just delete the vehicle.
            const { error } = await supabase.from('vehicles').delete().eq('id', id);
            if (error) throw error;

            showToast('Vehicle removed from garage', 'success');
            if (selectedId === id) onSelect('');
            fetchVehicles();
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
                <button className="btn-primary" onClick={handleOpenAdd}>
                    <Plus size={18} /> Add New Vehicle
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {vehicles.map((v) => (
                    <div
                        key={v.id}
                        className="glass-card"
                        style={{
                            padding: '0',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: selectedId === v.id ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            transform: selectedId === v.id ? 'translateY(-4px)' : 'none',
                            boxShadow: selectedId === v.id ? '0 12px 24px rgba(59, 130, 246, 0.2)' : 'none'
                        }}
                        onClick={() => onSelect(v.id)}
                    >
                        <div style={{ position: 'relative', height: '160px', background: 'rgba(255,255,255,0.03)' }}>
                            {v.image_url ? (
                                <img src={v.image_url} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>
                                    <Car size={64} />
                                </div>
                            )}

                            {selectedId === v.id && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    color: 'var(--accent-primary)',
                                    background: 'var(--bg-card)',
                                    borderRadius: '50%',
                                    padding: '2px'
                                }}>
                                    <CheckCircle2 size={24} fill="currentColor" color="var(--accent-primary)" />
                                </div>
                            )}

                            <div style={{ position: 'absolute', bottom: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                                <button
                                    className="icon-btn"
                                    onClick={(e) => handleOpenEdit(e, v)}
                                    style={{ background: 'rgba(0,0,0,0.5)', padding: '8px', backdropFilter: 'blur(4px)', borderRadius: '8px' }}
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    className="icon-btn"
                                    onClick={(e) => handleDelete(e, v.id)}
                                    style={{ background: 'rgba(220, 38, 38, 0.5)', padding: '8px', backdropFilter: 'blur(4px)', borderRadius: '8px' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>{v.name}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>{v.model} • {v.year}</p>

                            <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem' }}>
                                <div className="status-badge" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)' }}>
                                    {v.plate_number}
                                </div>
                                <div className="status-badge status-success">
                                    {(v.last_odometer || 0).toLocaleString()} km
                                </div>
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
                        <button className="btn-primary" style={{ margin: '0 auto' }} onClick={handleOpenAdd}>
                            Add Your First Vehicle
                        </button>
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}>
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
                    <div>
                        <label className="input-label">Vehicle Photo</label>
                        <div style={{
                            border: '1px dashed var(--glass-border)',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.02)',
                            position: 'relative',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: 0,
                                    cursor: 'pointer'
                                }}
                                disabled={uploading}
                            />
                            {uploading ? (
                                <div className="spinner" style={{ margin: '0 auto' }}></div>
                            ) : formData.image_url ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                    <img
                                        src={formData.image_url}
                                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                                    />
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Image Ready</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click or drop to change</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <ImageIcon size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click to upload vehicle photo</p>
                                </>
                            )}
                        </div>
                    </div>
                    <button className="btn-primary" style={{ marginTop: '12px', padding: '14px' }} onClick={handleSubmit} disabled={uploading}>
                        {isEditing ? 'Save Changes' : 'Register Vehicle'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Garage;
