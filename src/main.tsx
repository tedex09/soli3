import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupAuthInterceptor } from '@/stores/auth';

// Configura o interceptor de autenticação
setupAuthInterceptor();

createRoot(document.getElementById("root")!).render(<App />);