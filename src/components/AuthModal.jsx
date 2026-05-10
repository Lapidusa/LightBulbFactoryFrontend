import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function AuthModal({ open, onClose }) {
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

        <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            Email
            <input type="email" placeholder="mail@example.ru" autoComplete="email" />
          </label>
          <label>
            Пароль
            <input type="password" placeholder="Введите пароль" autoComplete="current-password" />
          </label>
          <button type="submit">Войти</button>
        </form>
      </section>
    </div>
  );
}
