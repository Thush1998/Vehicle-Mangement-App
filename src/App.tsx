import { useState } from 'react';
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Maintenance from './components/Maintenance'
import VehicleDetails from './components/VehicleDetails'

function App() {
    const [activeSection, setActiveSection] = useState('dashboard');

    return (
        <Layout activeSection={activeSection} onNavigate={setActiveSection}>
            <div style={{ minHeight: 'calc(100vh - 120px)' }}>
                {activeSection === 'dashboard' && <Dashboard />}
                {activeSection === 'vehicles' && <VehicleDetails />}
                {activeSection === 'logs' && <Maintenance />}
                {activeSection === 'parts' && (
                    <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '16px' }}>Parts Inventory</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Coming soon: Advanced inventory tracking for your spare parts.</p>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default App
