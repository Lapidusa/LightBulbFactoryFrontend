import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { money } from '../data/products.js';
import { addToCart } from '../store/cartSlice.js';
import { fetchCategories, fetchProducts } from '../store/productsSlice.js';

const PAGE_SIZE = 8;

export default function CatalogPage() {
  const dispatch = useDispatch();
  const { items: products, categories, meta, status, error } = useSelector((state) => state.products);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filters, setFilters] = useState({
    categoryId: 'all',
    baseType: 'all',
    brand: 'all',
    wattage: 'all',
    temperature: 'all',
    maxPrice: 4000,
    sort: 'new',
  });

  const query = useMemo(() => {
    const temperature = filters.temperature === 'warm' ? 2700 : filters.temperature === 'neutral' ? 4000 : filters.temperature === 'cold' ? 6500 : undefined;
    const sort = {
      new: ['newest', 'desc'],
      priceAsc: ['price', 'asc'],
      priceDesc: ['price', 'desc'],
      name: ['name', 'asc'],
    }[filters.sort];
    return {
      category_id: filters.categoryId,
      base_type: filters.baseType,
      brand: filters.brand,
      wattage: filters.wattage,
      color_temperature: temperature,
      max_price: filters.maxPrice,
      sort_by: sort[0],
      sort_order: sort[1],
      page: 1,
      page_size: visible,
    };
  }, [filters, visible]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts(query));
  }, [dispatch, query]);

  const baseTypes = useMemo(() => [...new Set(products.map((product) => product.baseType))].filter(Boolean).sort(), [products]);
  const brands = useMemo(() => [...new Set(products.map((product) => product.brand))].filter(Boolean).sort(), [products]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setVisible(PAGE_SIZE);
  };

  const resetFilters = () => {
    setFilters({
      categoryId: 'all',
      baseType: 'all',
      brand: 'all',
      wattage: 'all',
      temperature: 'all',
      maxPrice: 4000,
      sort: 'new',
    });
    setVisible(PAGE_SIZE);
  };

  return (
    <div className="page catalog-page">
      <section className="hero-band">
        <div>
          <p className="eyebrow">Каталог завода</p>
          <h1>Лампочки для дома, офиса и производства</h1>
          <p>
            Подберите лампы по типу, цоколю, характеристикам и наличию. Все готово для быстрого оформления заказа.
          </p>
        </div>
        <div className="hero-stat">
          <strong>{meta.total || products.length}</strong>
          <span>позиций в каталоге</span>
        </div>
      </section>

      <section className="catalog-layout">
        <aside className="filters" aria-label="Фильтры каталога">
          <div className="filters-title">
            <SlidersHorizontal size={18} />
            <h2>Фильтры</h2>
            <button type="button" className="round-icon-button" onClick={resetFilters} aria-label="Сбросить фильтры">
              <X size={16} />
            </button>
          </div>

          <label>
            Категория
            <select value={filters.categoryId} onChange={(event) => updateFilter('categoryId', event.target.value)}>
              <option value="all">Все категории</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>

          <label>
            Цоколь
            <select value={filters.baseType} onChange={(event) => updateFilter('baseType', event.target.value)}>
              <option value="all">Любой</option>
              {baseTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            Бренд/серия
            <select value={filters.brand} onChange={(event) => updateFilter('brand', event.target.value)}>
              <option value="all">Все серии</option>
              {brands.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            Мощность
            <select value={filters.wattage} onChange={(event) => updateFilter('wattage', event.target.value)}>
              <option value="all">Любая</option>
              <option value="8">до 8 Вт</option>
              <option value="15">до 15 Вт</option>
              <option value="40">до 40 Вт</option>
              <option value="120">до 120 Вт</option>
            </select>
          </label>

          <label>
            Цветовая температура
            <select value={filters.temperature} onChange={(event) => updateFilter('temperature', event.target.value)}>
              <option value="all">Любая</option>
              <option value="warm">Теплая</option>
              <option value="neutral">Нейтральная</option>
              <option value="cold">Холодная</option>
            </select>
          </label>

          <label>
            Цена до {money.format(filters.maxPrice)}
            <input
              type="range"
              min="100"
              max="4000"
              step="100"
              value={filters.maxPrice}
              onChange={(event) => updateFilter('maxPrice', event.target.value)}
            />
          </label>
        </aside>

        <div className="catalog-content">
          <div className="catalog-toolbar">
            <p>{status === 'loading' ? 'Загрузка...' : `Найдено: ${meta.total || products.length}`}</p>
            <label>
              Сортировка
              <select value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)}>
                <option value="new">Сначала новые</option>
                <option value="priceAsc">Цена по возрастанию</option>
                <option value="priceDesc">Цена по убыванию</option>
                <option value="name">По названию</option>
              </select>
            </label>
          </div>

          {status === 'failed' && (
            <div className="empty-state">
              <h2>Ошибка загрузки каталога</h2>
              <p>{error}</p>
              <button type="button" onClick={() => dispatch(fetchProducts(query))}>Повторить</button>
            </div>
          )}

          {status !== 'failed' && products.length === 0 ? (
            <div className="empty-state">
              <h2>По выбранным фильтрам ничего не найдено</h2>
              <p>Сбросьте параметры или расширьте диапазон цены.</p>
              <button type="button" onClick={resetFilters}>Сбросить фильтры</button>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <Link to={`/products/${product.id}`} className="product-image">
                    <img src={product.image} alt={product.name} />
                    {product.isNew && <span>Новинка</span>}
                  </Link>
                  <div className="product-card-body">
                    <p className="sku">{product.sku}</p>
                    <Link to={`/products/${product.id}`} className="product-name">
                      {product.name}
                    </Link>
                    <p>{product.shortDescription}</p>
                    <dl>
                      <div><dt>Цоколь</dt><dd>{product.baseType}</dd></div>
                      <div><dt>Мощность</dt><dd>{product.wattage} Вт</dd></div>
                      <div><dt>Температура</dt><dd>{product.colorTemperature} K</dd></div>
                    </dl>
                    <div className="product-card-footer">
                      <strong>{money.format(product.price)}</strong>
                      <button type="button" onClick={() => dispatch(addToCart(product))} disabled={product.stockQty === 0}>
                        {product.stockQty > 0 ? 'В корзину' : 'Нет в наличии'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {visible < (meta.total || 0) && (
            <button className="load-more" type="button" onClick={() => setVisible((value) => value + PAGE_SIZE)}>
              Показать еще
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
