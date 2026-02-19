import { useState } from 'react';
import Sidebar from './Sidebar';
import { Bell, Menu } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    activeSection: string;
    onNavigate: (section: string) => void;
}

const Layout = ({ children, activeSection, onNavigate }: LayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const getHeaderInfo = () => {
        switch (activeSection) {
            case 'dashboard':
                return { title: 'Dashboard Overview', subtitle: 'Track your vehicle health effortlessly.' };
            case 'garage':
                return { title: 'My Garage', subtitle: 'Manage your vehicle collection and assets.' };
            case 'logs':
                return { title: 'Service Logs', subtitle: 'Historical maintenance record and receipts.' };
            case 'parts':
                return { title: 'Parts Inventory', subtitle: 'Track spare parts and upcoming needs.' };
            default:
                return { title: 'Vehicle Management', subtitle: 'All-in-one vehicle care system.' };
        }
    };

    const header = getHeaderInfo();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activeSection={activeSection} onNavigate={onNavigate} />
            <main style={{
                marginLeft: isSidebarOpen ? 'var(--sidebar-width)' : '0',
                flex: 1,
                padding: '32px 48px',
                maxWidth: '1600px',
                margin: '0 auto',
                width: isSidebarOpen ? 'calc(100% - var(--sidebar-width))' : '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minHeight: '100vh'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {!isSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-primary)',
                                    padding: '8px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Menu size={20} />
                            </button>
                        )}
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>{header.title}</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>{header.subtitle}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{
                            padding: '10px',
                            borderRadius: '12px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--glass-border)',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)'
                        }}>
                            <Bell size={20} />
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '6px 16px 6px 6px',
                            borderRadius: '30px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--accent-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700
                            }}>T</div>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Thush</span>
                        </div>
                    </div>
                </div>
                {children}
            </main>
        </div>
    );
};

export default Layout;
