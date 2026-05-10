import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { money } from '../data/products.js';
import { useCart } from '../context/CartContext.jsx';

export default function CartPage() {
  const { cartItems, total, updateQuantity, removeFromCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="page narrow-page">
        <div className="empty-state">
          <h1>Корзина пуста</h1>
          <p>Добавьте лампы из каталога, чтобы перейти к оформлению заказа.</p>
          <Link className="button-link" to="/">Перейти в каталог</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-heading">
        <h1>Корзина</h1>
        <p>Проверьте количество и наличие перед оформлением.</p>
      </div>

      <section className="cart-layout">
        <div className="cart-list">
          {cartItems.map(({ product, quantity, lineTotal }) => (
            <article className="cart-item" key={product.id}>
              <img src={product.image} alt={product.name} />
              <div>
                <p className="sku">{product.sku}</p>
                <Link to={`/products/${product.slug}`}>{product.name}</Link>
                <span>{money.format(product.price)} за шт.</span>
                {quantity >= product.stockQty && <small>Доступный остаток: {product.stockQty} шт.</small>}
              </div>
              <div className="quantity-control" aria-label={`Количество ${product.name}`}>
                <button type="button" onClick={() => updateQuantity(product.id, quantity - 1)} aria-label="Уменьшить">
                  <Minus size={16} />
                </button>
                <input
                  value={quantity}
                  onChange={(event) => updateQuantity(product.id, event.target.value)}
                  inputMode="numeric"
                  aria-label="Количество"
                />
                <button type="button" onClick={() => updateQuantity(product.id, quantity + 1)} aria-label="Увеличить">
                  <Plus size={16} />
                </button>
              </div>
              <strong>{money.format(lineTotal)}</strong>
              <button
                className="icon-button"
                type="button"
                onClick={() => removeFromCart(product.id)}
                aria-label="Удалить позицию"
              >
                <Trash2 size={18} />
              </button>
            </article>
          ))}
        </div>

        <aside className="summary">
          <h2>Итого</h2>
          <div><span>Товары</span><strong>{money.format(total)}</strong></div>
          <div><span>Доставка</span><strong>по выбору</strong></div>
          <p>Остатки проверяются на mock-данных каталога.</p>
          <Link className="button-link" to="/checkout">Оформить заказ</Link>
        </aside>
      </section>
    </div>
  );
}
