import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Package } from 'lucide-react';
import { money } from '../utils/formatters.js';
import { addToCart } from '../store/cartSlice.js';
import { clearSelectedProduct, fetchProduct } from '../store/productsSlice.js';

export default function ProductPage() {
  const { slug: productId } = useParams();
  const dispatch = useDispatch();
  const { selected: product, selectedStatus, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProduct(productId));
    return () => dispatch(clearSelectedProduct());
  }, [dispatch, productId]);

  if (selectedStatus === 'loading' || selectedStatus === 'idle') {
    return (
      <div className="page narrow-page">
        <div className="empty-state">
          <h1>Загружаем товар</h1>
          <p>Подготавливаем характеристики и наличие.</p>
        </div>
      </div>
    );
  }

  if (!product || selectedStatus === 'failed') {
    return (
      <div className="page narrow-page">
        <div className="empty-state">
          <h1>Товар не найден</h1>
          <p>{error || 'Возможно, ссылка устарела или позиция скрыта из каталога.'}</p>
          <Link className="button-link" to="/">Вернуться в каталог</Link>
        </div>
      </div>
    );
  }

  const specs = [
    ['Артикул', product.sku],
    ['Тип лампы', product.type],
    ['Цоколь', product.baseType],
    ['Мощность', `${product.wattage} Вт`],
    ['Напряжение', `${product.voltage} В`],
    ['Цветовая температура', `${product.colorTemperature} K`],
    ['Световой поток', `${product.luminousFlux} лм`],
    ['Срок службы', `${product.lifetimeHours.toLocaleString('ru-RU')} ч`],
  ];

  return (
    <div className="page">
      <Link className="back-link" to="/">
        <ArrowLeft size={18} />
        Каталог
      </Link>

      <section className="product-detail">
        <div className="gallery">
          <img src={product.image} alt={product.name} />
          <div className="gallery-strip">
            <img src={product.image} alt="" />
            <div><Package size={20} /> Упаковка</div>
            <div><Check size={20} /> Гарантия</div>
          </div>
        </div>

        <div className="product-info">
          <p className="sku">{product.sku}</p>
          <h1>{product.name}</h1>
          <p className="lead">{product.description}</p>
          <div className="purchase-panel">
            <div>
              <span>Цена</span>
              <strong>{money.format(product.price)}</strong>
            </div>
            <p className={product.stockQty > 0 ? 'stock in-stock' : 'stock out-stock'}>
              {product.stockQty > 0 ? `В наличии: ${product.stockQty} шт.` : 'Нет в наличии'}
            </p>
            <button type="button" onClick={() => dispatch(addToCart(product))} disabled={product.stockQty === 0}>
              Добавить в корзину
            </button>
          </div>
        </div>
      </section>

      <section className="spec-section">
        <h2>Технические характеристики</h2>
        <dl className="spec-grid">
          {specs.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
