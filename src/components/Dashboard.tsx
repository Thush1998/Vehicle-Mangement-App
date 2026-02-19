import { useState, useEffect } from 'react';
import {
    Gauge,
    Banknote,
    ArrowUpRight,
    ChevronRight,
    ShieldCheck,
    AlertTriangle,
    Zap,
    FileText,
    Clock
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Modal from './Modal';
import { useToast } from './Toast';

const StatCard = ({ title, value, unit, icon: Icon, trend, color, children, onClick }: any) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="glass-card"
            style={{
                padding: '24px',
                flex: 1,
                position: 'relative',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s ease'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
            onMouseDown={(e) => onClick && (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => onClick && (e.currentTarget.style.transform = 'scale(1)')}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                    padding: '10px',
                    borderRadius: '12px',
                    background: `rgba(${color}, 0.1)`,
                    color: `rgb(${color})`
                }}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: trend.startsWith('+') ? '#ef4444' : '#10b981',
                        fontSize: '0.85rem',
                        fontWeight: 600
                    }}>
                        {trend} <ArrowUpRight size={16} />
                    </div>
                )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>{title}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{value}</h3>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{unit}</span>
            </div>

            {isHovered && children && (
                <div
                    className="glass-card"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '12px',
                        zIndex: 50,
                        padding: '16px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(59, 130, 246, 0.4)'
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    const [vehicle, setVehicle] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [insights, setInsights] = useState<string>('Analyzing fuel quality...');
    const [loading, setLoading] = useState(true);
    const [showOdomModal, setShowOdomModal] = useState(false);
    const [newOdom, setNewOdom] = useState('');
    const { showToast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        const { data: vData } = await supabase.from('vehicles').select('*').single();
        const { data: dData } = await supabase.from('documents').select('*');

        if (vData) setVehicle(vData);
        if (dData) setDocuments(dData);
        setLoading(false);

        // Mock insight for Fuel Station Quality
        setTimeout(() => {
            setInsights('Ceypetco gives you 1.8km/L more than IOC based on recent logs.');
        }, 1500);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateOdometer = async () => {
        if (!newOdom || isNaN(Number(newOdom))) {
            showToast('Please enter a valid odometer reading', 'error');
            return;
        }

        const value = Number(newOdom);
        if (value <= vehicle.last_odometer) {
            showToast('New reading must be higher than current', 'error');
            return;
        }

        try {
            const distance = value - vehicle.last_odometer;

            // 1. Update vehicle
            const { error: vError } = await supabase
                .from('vehicles')
                .update({ last_odometer: value })
                .eq('id', vehicle.id);

            if (vError) throw vError;

            // 2. Log trip
            const { error: tError } = await supabase
                .from('trips')
                .insert([{
                    vehicle_id: vehicle.id,
                    distance: distance,
                    trip_date: new Date().toISOString()
                }]);

            if (tError) throw tError;

            showToast('Odometer updated and trip logged!', 'success');
            setShowOdomModal(false);
            setNewOdom('');
            fetchData();
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    const calculateHealth = (lastService: number, threshold: number) => {
        if (!vehicle) return 100;
        const distanceSinceService = vehicle.last_odometer - lastService;
        const health = Math.round(((threshold - distanceSinceService) / threshold) * 100);
        return Math.max(0, health);
    };

    const oilHealth = calculateHealth(vehicle?.oil_last_service || 0, 5000);
    const brakeHealth = calculateHealth(vehicle?.brake_last_service || 0, 30000);

    const calculateExpiryDays = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Top Stats */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <StatCard
                    title="Total Odometer"
                    value={vehicle?.last_odometer?.toLocaleString() || '---'}
                    unit="km"
                    icon={Gauge}
                    color="59, 130, 246"
                    onClick={() => setShowOdomModal(true)}
                >
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Click to update reading</p>
                </StatCard>

                <StatCard
                    title="Monthly Expense"
                    value="45,800"
                    unit="LKR"
                    icon={Banknote}
                    trend="+12%"
                    color="16, 185, 129"
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span>⛽ Fuel</span>
                            <span style={{ fontWeight: 600 }}>28,500 LKR</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span>🛠️ Parts</span>
                            <span style={{ fontWeight: 600 }}>12,300 LKR</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span>🔧 Service</span>
                            <span style={{ fontWeight: 600 }}>5,000 LKR</span>
                        </div>
                    </div>
                </StatCard>

                <StatCard
                    title="Fuel Insight"
                    value="92.5"
                    unit="Score"
                    icon={Zap}
                    color="245, 158, 11"
                >
                    <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{insights}</p>
                </StatCard>

                <StatCard
                    title="Doc Expiration"
                    value={documents.length > 0 ? calculateExpiryDays(documents[0].expiry_date) : '--'}
                    unit="Days"
                    icon={Clock}
                    color="239, 68, 68"
                >
                    {documents.map((doc, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                            <span>{doc.type}</span>
                            <span style={{ color: calculateExpiryDays(doc.expiry_date) < 30 ? 'var(--accent-danger)' : 'var(--accent-secondary)' }}>
                                {calculateExpiryDays(doc.expiry_date)}d left
                            </span>
                        </div>
                    ))}
                </StatCard>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px' }}>
                {/* Main Vehicle Preview */}
                <div className="glass-card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                        height: '240px',
                        background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=1000") center/cover',
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: '24px'
                    }}>
                        <div>
                            <div className="status-badge status-success" style={{ marginBottom: '8px', display: 'inline-block' }}>
                                Healthy Condition
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>{vehicle?.name || '---'}</h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}>{vehicle?.plate_number || '---'} | {vehicle?.year || '---'} Model</p>
                        </div>
                    </div>
                    <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Engine Oil Health</p>
                            <div style={{ height: '6px', background: '#2a2a2d', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${oilHealth}%`,
                                    height: '100%',
                                    background: oilHealth > 30 ? 'var(--accent-secondary)' : 'var(--accent-danger)',
                                    transition: 'width 0.5s ease'
                                }}></div>
                            </div>
                            <p style={{ fontSize: '0.85rem', marginTop: '4px', fontWeight: 600 }}>
                                {oilHealth === 0 ? '0% - Service Overdue' : `${oilHealth}% Remaining`}
                            </p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Brake Pads Health</p>
                            <div style={{ height: '6px', background: '#2a2a2d', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${brakeHealth}%`,
                                    height: '100%',
                                    background: brakeHealth > 30 ? 'var(--accent-primary)' : 'var(--accent-danger)',
                                    transition: 'width 0.5s ease'
                                }}></div>
                            </div>
                            <p style={{ fontSize: '0.85rem', marginTop: '4px', fontWeight: 600 }}>
                                {brakeHealth === 0 ? '0% - Service Overdue' : `${brakeHealth}% Remaining`}
                            </p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Digital Vault</p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                <div title="Insurance" style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--accent-primary)' }}>
                                    <FileText size={18} />
                                </div>
                                <div title="License" style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--accent-secondary)' }}>
                                    <FileText size={18} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reminders List */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.2rem' }}>Service Reminders</h3>
                        <span style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>View All</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {oilHealth <= 20 && (
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                <div style={{ color: 'var(--accent-danger)' }}><AlertTriangle size={20} /></div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Change Engine Oil</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {oilHealth === 0 ? 'Priority: Urgent' : `Remaining: ${oilHealth}%`}
                                    </p>
                                </div>
                                <ChevronRight size={16} color="var(--text-secondary)" />
                            </div>
                        )}
                        {brakeHealth <= 20 && (
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                <div style={{ color: 'var(--accent-danger)' }}><AlertTriangle size={20} /></div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Check Brake Pads</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {brakeHealth === 0 ? 'Priority: Urgent' : `Remaining: ${brakeHealth}%`}
                                    </p>
                                </div>
                                <ChevronRight size={16} color="var(--text-secondary)" />
                            </div>
                        )}
                        {documents.some(doc => calculateExpiryDays(doc.expiry_date) < 30) && (
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                                <div style={{ color: '#fbbf24' }}><ShieldCheck size={20} /></div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Document Renewal</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Next Expiry: {Math.min(...documents.map(d => calculateExpiryDays(d.expiry_date)))} days</p>
                                </div>
                                <ChevronRight size={16} color="var(--text-secondary)" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Modals */}
            <Modal
                isOpen={showOdomModal}
                onClose={() => setShowOdomModal(false)}
                title="Update Odometer"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                            New Odometer Reading (Current: {vehicle?.last_odometer} km)
                        </label>
                        <input
                            type="number"
                            value={newOdom}
                            onChange={(e) => setNewOdom(e.target.value)}
                            placeholder="Enter mileage..."
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--glass-border)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button
                        onClick={handleUpdateOdometer}
                        className="btn-primary"
                        style={{ padding: '14px', width: '100%' }}
                    >
                        Save & Log Trip
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
