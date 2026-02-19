import { useState, useEffect } from 'react';
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Maintenance from './components/Maintenance'
import VehicleDetails from './components/VehicleDetails'
import Garage from './components/Garage'

function App() {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
        localStorage.getItem('selectedVehicleId')
    );

    useEffect(() => {
        if (selectedVehicleId) {
            localStorage.setItem('selectedVehicleId', selectedVehicleId);
        }
    }, [selectedVehicleId]);

    return (
        <Layout activeSection={activeSection} onNavigate={setActiveSection}>
            <div style={{ minHeight: 'calc(100vh - 120px)' }}>
                {activeSection === 'dashboard' && (
                    selectedVehicleId ? <Dashboard vehicleId={selectedVehicleId} /> : <Garage onSelect={setSelectedVehicleId} />
                )}
                {activeSection === 'garage' && <Garage onSelect={setSelectedVehicleId} selectedId={selectedVehicleId} />}
                {activeSection === 'vehicles' && selectedVehicleId && <VehicleDetails vehicleId={selectedVehicleId} />}
                {activeSection === 'logs' && selectedVehicleId && <Maintenance vehicleId={selectedVehicleId} />}
                {activeSection === 'parts' && (
                    <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '16px' }}>Parts Inventory</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Coming soon: Advanced inventory tracking for your spare parts.</p>
                    </div>
                )}
                {!selectedVehicleId && activeSection !== 'garage' && (
                    <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '16px' }}>No Vehicle Selected</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Please select a vehicle from your garage to view its details.</p>
                        <button className="btn-primary" onClick={() => setActiveSection('garage')}>Go to Garage</button>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default App
