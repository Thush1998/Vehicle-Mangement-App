import { useState } from 'react';
import Sidebar from './Sidebar';
import { Bell, Menu } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
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
                            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>Dashboard Overview</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Welcome back, track your vehicle health effortlessly.</p>
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
