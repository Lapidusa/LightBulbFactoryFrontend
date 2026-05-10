import React from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { money } from '../data/products.js';

export default function ConfirmationPage() {
  const lastOrder = useSelector((state) => state.orders.lastOrder);

  if (!lastOrder) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page narrow-page">
      <section className="confirmation">
        <CheckCircle2 size={52} />
        <p className="eyebrow">Статус: {lastOrder.status || 'created'}</p>
        <h1>Заказ {lastOrder.order_number || lastOrder.orderNumber} оформлен</h1>
        <p>Заказ принят. Сохраните номер, чтобы уточнить статус обработки.</p>

        <div className="confirmation-list">
          {(lastOrder.items || []).map((item) => (
            <div key={item.id || item.product_id || item.product?.id}>
              <span>{item.product_name || item.product?.name || 'Товар'} x {item.quantity}</span>
              <strong>{money.format(Number(item.line_total || item.lineTotal || 0))}</strong>
            </div>
          ))}
          <div>
            <span>Итоговая сумма</span>
            <strong>{money.format(Number(lastOrder.total_amount || lastOrder.total || 0))}</strong>
          </div>
        </div>

        <Link className="button-link" to="/">Вернуться в каталог</Link>
      </section>
    </div>
  );
}
