import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { loginAdmin, logoutAdmin } from '../store/authSlice.js';

export default function AuthModal({ open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' });

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    if (token) {
      await dispatch(logoutAdmin());
      onClose();
      navigate('/');
      return;
    }
    const result = await dispatch(loginAdmin(form));
    if (loginAdmin.fulfilled.match(result)) {
      onClose();
      navigate('/admin');
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Личный кабинет</p>
            <h2 id="auth-title">Вход</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Закрыть окно">
            <X size={18} />
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {token ? (
            <p className="modal-copy">Вы уже вошли как администратор. Можно перейти в панель управления или выйти.</p>
          ) : (
            <>
              <label>
                Логин
                <input
                  value={form.username}
                  onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                  autoComplete="username"
                />
              </label>
              <label>
                Пароль
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  autoComplete="current-password"
                />
              </label>
            </>
          )}
          {error && <small>{error}</small>}
          <button type="submit" disabled={status === 'loading'}>
            {token ? 'Выйти' : status === 'loading' ? 'Входим...' : 'Войти'}
          </button>
          {token && (
            <button type="button" className="secondary-button" onClick={() => { onClose(); navigate('/admin'); }}>
              Открыть админку
            </button>
          )}
        </form>
      </section>
    </div>
  );
}
