import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page narrow-page">
      <div className="empty-state">
        <h1>Страница не найдена</h1>
        <p>Такого маршрута нет в пользовательской части магазина.</p>
        <Link className="button-link" to="/">Открыть каталог</Link>
      </div>
    </div>
  );
}
