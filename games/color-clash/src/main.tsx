import { createRoot } from 'react-dom/client';
import App from './App';
import '@wizkidz/design-system/tokens.css';
import '@wizkidz/design-system/animations.css';
import './styles/game.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');
createRoot(root).render(<App />);
