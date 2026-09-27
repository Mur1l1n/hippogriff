import { useState } from 'react';
import { loginUser, registerUser } from '../ipv4Api';

export function AuthDialog({ isOpen, onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const user = mode === 'register'
        ? await registerUser(form)
        : await loginUser(form);
      const sessionUser = { id: user.id, name: user.name, email: user.email };
      onAuthenticated(sessionUser);
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível concluir a solicitação.');
    } finally {
      setBusy(false);
    }
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  return (
    <div className="auth-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" type="button" onClick={onClose} aria-label="Fechar">×</button>
        <p className="kicker"><span className="kicker-line"></span> HIPPOGRIFF · CONTA</p>
        <h2 id="auth-title">{mode === 'login' ? 'Entre para salvar.' : 'Crie sua conta.'}</h2>
        <p className="auth-description">O uso da calculadora continua livre. A conta permite guardar e recuperar suas configurações.</p>

        <div className="auth-tabs" role="tablist" aria-label="Acesso à conta">
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'selected' : ''} onClick={() => changeMode('login')}>Entrar</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'selected' : ''} onClick={() => changeMode('register')}>Cadastrar</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>Nome
              <input autoComplete="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
          )}
          <label>E-mail
            <input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label>Senha
            <input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength="4" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="button button-primary full-button" type="submit" disabled={busy}>
            {busy ? 'Aguarde...' : mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-disclaimer">Ambiente provisório: os dados ficam em JSON local e as senhas não são protegidas. Não use credenciais reais.</p>
      </section>
    </div>
  );
}