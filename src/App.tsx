import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Maintenance from './components/Maintenance'
import VehicleDetails from './components/VehicleDetails'

function App() {
    return (
        <Layout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                {/* Dashboard Section */}
                <section>
                    <Dashboard />
                </section>

                {/* Vehicle Details Section */}
                <section id="vehicle">
                    <VehicleDetails />
                </section>

                {/* Maintenance & Parts Section */}
                <section id="maintenance">
                    <Maintenance />
                </section>
            </div>
        </Layout>
    )
}

export default App
