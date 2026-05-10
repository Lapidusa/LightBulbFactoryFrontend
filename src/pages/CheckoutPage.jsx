import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { money } from '../data/products.js';
import { useCart } from '../context/CartContext.jsx';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  city: '',
  address: '',
  comment: '',
  deliveryType: 'courier',
  paymentType: 'on_receipt',
};

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  const normalized = digits.startsWith('8') ? `7${digits.slice(1)}` : digits.startsWith('7') ? digits : `7${digits}`;
  const phone = normalized.slice(0, 11);
  const parts = {
    code: phone.slice(1, 4),
    first: phone.slice(4, 7),
    second: phone.slice(7, 9),
    third: phone.slice(9, 11),
  };

  let result = '+7';
  if (parts.code) result += ` (${parts.code}`;
  if (parts.code.length === 3) result += ')';
  if (parts.first) result += ` ${parts.first}`;
  if (parts.second) result += `-${parts.second}`;
  if (parts.third) result += `-${parts.third}`;
  return result;
}

export default function CheckoutPage() {
  const { cartItems, total, createOrder } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  if (cartItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === 'phone' ? formatPhone(value) : value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (form.name.trim().length < 3) nextErrors.name = 'Укажите ФИО';
    if (form.phone.replace(/\D/g, '').length !== 11) nextErrors.phone = 'Укажите корректный телефон';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Укажите корректный email';
    if (form.city.trim().length < 2) nextErrors.city = 'Укажите город';
    if (form.deliveryType === 'courier' && form.address.trim().length < 5) {
      nextErrors.address = 'Укажите адрес доставки';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    createOrder(form);
    navigate('/confirmation');
  };

  return (
    <div className="page">
      <div className="page-heading">
        <h1>Оформление заказа</h1>
        <p>Регистрация не требуется. Данные нужны для связи и доставки.</p>
      </div>

      <section className="checkout-layout">
        <form className="checkout-form" onSubmit={submit} noValidate>
          <div className="form-grid">
            <label>
              ФИО
              <input name="name" value={form.name} onChange={update} placeholder="Иванов Иван Иванович" />
              {errors.name && <small>{errors.name}</small>}
            </label>
            <label>
              Телефон
              <input
                name="phone"
                value={form.phone}
                onChange={update}
                placeholder="+7 (900) 000-00-00"
                inputMode="tel"
                maxLength="18"
              />
              {errors.phone && <small>{errors.phone}</small>}
            </label>
            <label>
              Email
              <input name="email" value={form.email} onChange={update} placeholder="mail@example.ru" />
              {errors.email && <small>{errors.email}</small>}
            </label>
            <label>
              Город
              <input name="city" value={form.city} onChange={update} placeholder="Москва" />
              {errors.city && <small>{errors.city}</small>}
            </label>
          </div>

          <div className="segmented">
            <label>
              <input
                type="radio"
                name="deliveryType"
                value="courier"
                checked={form.deliveryType === 'courier'}
                onChange={update}
              />
              Доставка курьером
            </label>
            <label>
              <input
                type="radio"
                name="deliveryType"
                value="pickup"
                checked={form.deliveryType === 'pickup'}
                onChange={update}
              />
              Самовывоз
            </label>
          </div>

          <label>
            Адрес доставки
            <input
              name="address"
              value={form.address}
              onChange={update}
              placeholder={form.deliveryType === 'pickup' ? 'Можно оставить пустым' : 'Улица, дом, квартира'}
            />
            {errors.address && <small>{errors.address}</small>}
          </label>

          <div className="segmented">
            <label>
              <input
                type="radio"
                name="paymentType"
                value="on_receipt"
                checked={form.paymentType === 'on_receipt'}
                onChange={update}
              />
              При получении
            </label>
            <label>
              <input
                type="radio"
                name="paymentType"
                value="online_stub"
                checked={form.paymentType === 'online_stub'}
                onChange={update}
              />
              Онлайн-заглушка
            </label>
          </div>

          <label>
            Комментарий
            <textarea name="comment" value={form.comment} onChange={update} rows="4" />
          </label>

          <div className="form-actions">
            <Link to="/cart">Вернуться в корзину</Link>
            <button type="submit">Подтвердить заказ</button>
          </div>
        </form>

        <aside className="summary">
          <h2>Состав заказа</h2>
          {cartItems.map(({ product, quantity, lineTotal }) => (
            <div key={product.id}>
              <span>{product.name} x {quantity}</span>
              <strong>{money.format(lineTotal)}</strong>
            </div>
          ))}
          <div className="summary-total">
            <span>Итого</span>
            <strong>{money.format(total)}</strong>
          </div>
        </aside>
      </section>
    </div>
  );
}
