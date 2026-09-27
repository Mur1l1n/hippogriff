import { useEffect, useState } from 'react';
import './styles.css';
import { AuthDialog } from './features/ipv4/components/AuthDialog';
import { getUserSubnetworks, saveSubnetwork } from './features/ipv4/ipv4Api';
import { HomePage } from './features/home/HomePage';
import { NetworkWorkspace } from './features/workspace/NetworkWorkspace';

const getCurrentPage = () => window.location.hash === '#workspace' ? 'workspace' : 'home';

function App() {
  const [page, setPage] = useState(getCurrentPage);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hippogriff-user'));
    } catch {
      return null;
    }
  });
  const [authOpen, setAuthOpen] = useState(false);
  const [subnetworks, setSubnetworks] = useState([]);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const syncPage = () => setPage(getCurrentPage());
    window.addEventListener('hashchange', syncPage);
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);

  useEffect(() => {
    if (!user) {
      localStorage.removeItem('hippogriff-user');
      setSubnetworks([]);
      return undefined;
    }

    localStorage.setItem('hippogriff-user', JSON.stringify(user));
    let active = true;
    getUserSubnetworks(user.id)
      .then((items) => active && setSubnetworks(items))
      .catch((error) => active && setSaveMessage(error.message));

    return () => { active = false; };
  }, [user]);

  const handleSaveSubnetwork = async (configuration) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    setSaveMessage('');
    try {
      await saveSubnetwork(user.id, configuration);
      setSubnetworks(await getUserSubnetworks(user.id));
      setSaveMessage('Configuração salva na sua conta.');
    } catch (error) {
      setSaveMessage(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hippogriff-user');
    setUser(null);
  };

  return (
    <div className="app-shell app-shell-page">
      <header className="site-header">
        <a className="site-brand" href="#home" aria-label="HIPPOGRIFF início">
          <span className="site-brand-mark"><img src="/static/logo.png" alt="" /></span>
          <span>HIPPOGRIFF<span className="brand-period">.</span></span>
        </a>
        <nav className="site-nav" aria-label="Navegação principal">
          <a className={page === 'home' ? 'site-nav-link active' : 'site-nav-link'} href="#home">Início</a>
          <a className={page === 'workspace' ? 'site-nav-link active' : 'site-nav-link'} href="#workspace">Workspace</a>
        </nav>
        <div className="site-account">
          {user ? <span className="site-user">{user.name}</span> : <span className="site-user">Planejamento livre</span>}
          <button className="account-button" type="button" onClick={user ? handleLogout : () => setAuthOpen(true)}>{user ? 'Sair' : 'Entrar'}</button>
        </div>
      </header>

      {page === 'workspace' ? (
        <NetworkWorkspace
          user={user}
          subnetworks={subnetworks}
          saveMessage={saveMessage}
          onRequestLogin={() => setAuthOpen(true)}
          onSave={handleSaveSubnetwork}
          onLoad={() => { window.location.hash = 'workspace'; }}
        />
      ) : <HomePage />}

      <footer className="site-footer"><span>HIPPOGRIFF · Planejamento visual de redes IPv4</span><a href="#workspace">Abrir workspace →</a></footer>

      <AuthDialog
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(authenticatedUser) => {
          setUser(authenticatedUser);
          setAuthOpen(false);
        }}
      />
    </div>
  );
}

export default App;