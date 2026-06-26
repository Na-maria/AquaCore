import { LayoutGrid, BrainCircuit, Server, FileText, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const MENU_ITEMS = [
  { label: 'Dashboard', icon: LayoutGrid, path: '/' },
  { label: 'Previsão IA', icon: BrainCircuit, path: '/previsao-ia' },
  { label: 'Servidores', icon: Server, path: '/servidores' },
  { label: 'Relatórios', icon: FileText, path: '/relatorios' },
  { label: 'Configurações', icon: Settings, path: '/configuracoes' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo-aquacore.png" alt="AquaCore" />
      </div>

      <nav className="sidebar-nav">
        {MENU_ITEMS.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={label}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-avatar">EI</div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">Equipe Núcleo IA</span>
          <span className="sidebar-user-email">admin@aquacore.io</span>
        </div>
      </div>
    </aside>
  );
}
