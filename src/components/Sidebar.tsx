import {
    LayoutDashboard,
    Car,
    Wrench,
    Settings,
    Bell,
    History,
    Package,
    X
} from 'lucide-react';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    activeSection: string;
    onNavigate: (section: string) => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            backgroundColor: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
            marginBottom: '4px',
            border: active ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent'
        }}
        onMouseEnter={(e) => {
            if (!active) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'var(--text-primary)';
            }
        }}
        onMouseLeave={(e) => {
            if (!active) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
            }
        }}
    >
        <Icon size={20} />
        <span style={{ fontWeight: 500 }}>{label}</span>
    </div>
);

const Sidebar = ({ isOpen, setIsOpen, activeSection, onNavigate }: SidebarProps) => {
    return (
        <div style={{
            width: 'var(--sidebar-width)',
            height: '100vh',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--glass-border)',
            background: 'var(--bg-sidebar)',
            backdropFilter: 'blur(20px)',
            position: 'fixed',
            left: isOpen ? 0 : 'calc(-1 * var(--sidebar-width))',
            top: 0,
            zIndex: 100,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: isOpen ? 1 : 0,
            visibility: isOpen ? 'visible' : 'hidden'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px',
                padding: '0 8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <Car size={20} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }} className="gradient-text">AutoDoc</h2>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    <X size={20} />
                </button>
            </div>

            <div style={{ flex: 1 }}>
                <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeSection === 'dashboard'} onClick={() => onNavigate('dashboard')} />
                <SidebarItem icon={Car} label="My Vehicles" active={activeSection === 'vehicles'} onClick={() => onNavigate('vehicles')} />
                <SidebarItem icon={Wrench} label="Service Logs" active={activeSection === 'logs'} onClick={() => onNavigate('logs')} />
                <SidebarItem icon={Package} label="Parts Inventory" active={activeSection === 'parts'} onClick={() => onNavigate('parts')} />
                <SidebarItem icon={History} label="Maintenance Hist." active={activeSection === 'history'} onClick={() => onNavigate('logs')} />
                <SidebarItem icon={Bell} label="Reminders" active={activeSection === 'reminders'} onClick={() => onNavigate('dashboard')} />
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                <SidebarItem icon={Settings} label="Settings" />
                <div style={{
                    marginTop: '12px',
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.1)'
                }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Pro Features</p>
                    <button style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '8px',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                    }}>Upgrade Now</button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
