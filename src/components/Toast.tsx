import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useState, createContext, useContext } from 'react';

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        style={{
                            background: 'var(--bg-card)',
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${toast.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                            padding: '16px 20px',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            animation: 'toastIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            minWidth: '300px'
                        }}
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle size={20} color="#10b981" />
                        ) : (
                            <AlertCircle size={20} color="#ef4444" />
                        )}
                        <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
                        <X
                            size={16}
                            style={{ cursor: 'pointer', opacity: 0.5 }}
                            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                        />
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes toastIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
