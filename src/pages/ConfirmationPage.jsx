import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { money } from '../data/products.js';
import { useCart } from '../context/CartContext.jsx';

export default function ConfirmationPage() {
  const { lastOrder } = useCart();

  if (!lastOrder) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page narrow-page">
      <section className="confirmation">
        <CheckCircle2 size={52} />
        <p className="eyebrow">Статус: создан</p>
        <h1>Заказ {lastOrder.orderNumber} оформлен</h1>
        <p>Мы сохранили состав заказа и контактные данные в локальном состоянии приложения.</p>

        <div className="confirmation-list">
          {lastOrder.items.map(({ product, quantity, lineTotal }) => (
            <div key={product.id}>
              <span>{product.name} x {quantity}</span>
              <strong>{money.format(lineTotal)}</strong>
            </div>
          ))}
          <div>
            <span>Итоговая сумма</span>
            <strong>{money.format(lastOrder.total)}</strong>
          </div>
        </div>

        <Link className="button-link" to="/">Вернуться в каталог</Link>
      </section>
    </div>
  );
}
