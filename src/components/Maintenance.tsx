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

    const handleUpdateOdometer = async () => {
        const odo = parseInt(newOdometer);
        if (!odo) return;

        const { data: vehicle } = await supabase.from('vehicles').select('*').single();
        if (vehicle) {
            const distance = odo - vehicle.last_odometer;

            // Update Vehicle
            await supabase.from('vehicles').update({ last_odometer: odo }).eq('id', vehicle.id);

            // Create Trip
            await supabase.from('trips').insert({
                vehicle_id: vehicle.id,
                distance: Math.max(0, distance),
                odometer_reading: odo
            });

            setNewOdometer('');
            alert(`Trip recorded: ${distance}km added!`);
        }
    };

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
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'var(--accent-primary)',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer'
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
                            {[
                                { type: 'Full Service', date: 'Jan 15, 2024', mileage: '24,100 km', labor: '12,500', parts: '28,400', total: '40,900' },
                                { type: 'Brake Pad Replacement', date: 'Nov 02, 2023', mileage: '21,500 km', labor: '4,500', parts: '15,000', total: '19,500' },
                                { type: 'Tire Rotation', date: 'Aug 20, 2023', mileage: '18,200 km', labor: '3,000', parts: '0', total: '3,000' }
                            ].map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '16px', fontWeight: 600 }}>{item.type}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{item.date}</td>
                                    <td style={{ padding: '16px' }}>{item.mileage}</td>
                                    <td style={{ padding: '16px' }}>{item.labor}</td>
                                    <td style={{ padding: '16px' }}>{item.parts}</td>
                                    <td style={{ padding: '16px', color: 'var(--accent-secondary)', fontWeight: 700 }}>{item.total}</td>
                                    <td style={{ padding: '16px' }}>
                                        <button style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>Details</button>
                                    </td>
                                </tr>
                            ))}
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
        </div>
    );
};

export default Maintenance;
