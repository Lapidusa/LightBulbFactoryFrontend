import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart3, Boxes, LogOut, PackagePlus, RefreshCw, ShoppingBag } from 'lucide-react';
import { money } from '../utils/formatters.js';
import { fixText } from '../api/client.js';
import { fetchCurrentAdmin, logoutAdmin } from '../store/authSlice.js';
import { fetchCategories } from '../store/productsSlice.js';
import {
  changeOrderStatus,
  deleteAdminProduct,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchDashboard,
  saveAdminProduct,
} from '../store/adminSlice.js';

const emptyProduct = {
  sku: '',
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  categoryId: '',
  price: 0,
  stockQty: 0,
  wattage: 9,
  baseType: 'E27',
  colorTemperature: 4000,
  luminousFlux: 800,
  voltage: 220,
  lifetimeHours: 15000,
  brand: '',
  series: '',
  isActive: true,
  image: 'https://placehold.co/800x600?text=Lamp',
};

const statuses = ['created', 'confirmed', 'processing', 'shipped', 'completed', 'canceled'];

export default function AdminPage() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const adminUser = useSelector((state) => state.auth.admin);
  const categories = useSelector((state) => state.products.categories);
  const { dashboard, products, orders, status, error } = useSelector((state) => state.admin);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [productSearch, setProductSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');

  useEffect(() => {
    if (!token) return;
    dispatch(fetchCurrentAdmin());
    dispatch(fetchCategories());
    dispatch(fetchDashboard());
    dispatch(fetchAdminProducts());
    dispatch(fetchAdminOrders());
  }, [dispatch, token]);

  useEffect(() => {
    if (!categories[0]?.id) return;
    setProductForm((current) => (
      current.categoryId ? current : { ...current, categoryId: categories[0].id }
    ));
  }, [categories]);

  const dashboardCards = useMemo(
    () => [
      { label: 'Товары', value: dashboard?.products_count ?? products.length, icon: Boxes },
      { label: 'Активные заказы', value: dashboard?.active_orders_count ?? orders.length, icon: ShoppingBag },
      { label: 'Созданы', value: dashboard?.orders_by_status?.created ?? 0, icon: BarChart3 },
    ],
    [dashboard, orders.length, products.length],
  );

  const updateProductForm = (field, value) => {
    setProductForm((current) => ({ ...current, [field]: value }));
  };

  const editProduct = (product) => {
    setProductForm({
      ...emptyProduct,
      ...product,
      categoryId: product.categoryId || categories[0]?.id || '',
    });
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    const product = {
      ...productForm,
      categoryId: productForm.categoryId || categories[0]?.id || '',
    };
    const result = await dispatch(saveAdminProduct(product));
    if (!saveAdminProduct.fulfilled.match(result)) return;
    await dispatch(fetchDashboard());
    setProductForm({ ...emptyProduct, categoryId: categories[0]?.id || '' });
  };

  const refreshOrders = (statusValue = orderStatus) => {
    dispatch(fetchAdminOrders({ status: statusValue === 'all' ? undefined : statusValue }));
    dispatch(fetchDashboard());
  };

  return (
    <div className="page admin-page">
      <div className="admin-topbar">
        <div>
          <p className="eyebrow">Панель управления</p>
          <h1>Админка магазина</h1>
          <p>Управление каталогом, остатками и заказами магазина.</p>
        </div>
        <button type="button" onClick={() => dispatch(logoutAdmin())}>
          <LogOut size={18} />
          Выйти
        </button>
      </div>

      {error && <div className="admin-alert">{error}</div>}

      <section className="admin-grid">
        {dashboardCards.map(({ label, value, icon: Icon }) => (
          <article className="admin-stat" key={label}>
            <Icon size={22} />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
        <article className="admin-stat">
          <span>Администратор</span>
          <strong>{fixText(adminUser?.full_name || adminUser?.username || 'admin')}</strong>
        </article>
      </section>

      <section className="admin-section">
        <div className="section-title">
          <div>
            <h2>Товары</h2>
            <p>Поиск, создание, быстрые правки и удаление товарных позиций.</p>
          </div>
          <button type="button" onClick={() => dispatch(fetchAdminProducts({ search: productSearch }))}>
            <RefreshCw size={16} />
            Обновить
          </button>
        </div>

        <div className="admin-tools">
          <input
            value={productSearch}
            onChange={(event) => setProductSearch(event.target.value)}
            placeholder="Название или артикул"
          />
          <button type="button" onClick={() => dispatch(fetchAdminProducts({ search: productSearch }))}>
            Найти
          </button>
        </div>

        <div className="admin-split">
          <form className="admin-form" onSubmit={submitProduct}>
            <h3>{productForm.id ? 'Редактирование товара' : 'Новый товар'}</h3>
            <div className="form-grid">
              <label>Артикул<input value={productForm.sku} onChange={(event) => updateProductForm('sku', event.target.value)} required /></label>
              <label>Название<input value={productForm.name} onChange={(event) => updateProductForm('name', event.target.value)} required /></label>
              <label>Slug<input value={productForm.slug} onChange={(event) => updateProductForm('slug', event.target.value)} required /></label>
              <label>Категория<select value={productForm.categoryId} onChange={(event) => updateProductForm('categoryId', event.target.value)} required>
                <option value="">Выберите</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select></label>
              <label>Цена<input type="number" value={productForm.price} onChange={(event) => updateProductForm('price', event.target.value)} required /></label>
              <label>Остаток<input type="number" value={productForm.stockQty} onChange={(event) => updateProductForm('stockQty', event.target.value)} required /></label>
              <label>Мощность<input type="number" value={productForm.wattage} onChange={(event) => updateProductForm('wattage', event.target.value)} required /></label>
              <label>Цоколь<input value={productForm.baseType} onChange={(event) => updateProductForm('baseType', event.target.value)} required /></label>
              <label>Температура<input type="number" value={productForm.colorTemperature} onChange={(event) => updateProductForm('colorTemperature', event.target.value)} required /></label>
              <label>Световой поток<input type="number" value={productForm.luminousFlux} onChange={(event) => updateProductForm('luminousFlux', event.target.value)} required /></label>
              <label>Бренд<input value={productForm.brand} onChange={(event) => updateProductForm('brand', event.target.value)} required /></label>
              <label>Серия<input value={productForm.series} onChange={(event) => updateProductForm('series', event.target.value)} required /></label>
            </div>
            <label>Краткое описание<input value={productForm.shortDescription} onChange={(event) => updateProductForm('shortDescription', event.target.value)} required /></label>
            <label>Описание<textarea rows="3" value={productForm.description} onChange={(event) => updateProductForm('description', event.target.value)} required /></label>
            <label>Изображение<input value={productForm.image} onChange={(event) => updateProductForm('image', event.target.value)} /></label>
            <label className="checkbox-row">
              <input type="checkbox" checked={productForm.isActive} onChange={(event) => updateProductForm('isActive', event.target.checked)} />
              Активен
            </label>
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => setProductForm({ ...emptyProduct, categoryId: categories[0]?.id || '' })}>
                <PackagePlus size={16} />
                Очистить
              </button>
              <button type="submit" disabled={status === 'loading'}>{productForm.id ? 'Сохранить' : 'Создать'}</button>
            </div>
          </form>

          <div className="admin-table">
            {products.map((product) => (
              <article className="admin-row" key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.sku} · {product.baseType} · {money.format(product.price)}</span>
                </div>
                <div className="row-actions">
                  <button type="button" className="secondary-button" onClick={() => editProduct(product)}>Править</button>
                  <button type="button" className="danger-button" onClick={() => dispatch(deleteAdminProduct(product.id))}>Удалить</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="admin-section">
        <div className="section-title">
          <div>
            <h2>Заказы</h2>
            <p>Список заказов, фильтрация и смена статуса обработки.</p>
          </div>
          <button type="button" onClick={() => refreshOrders()}>
            <RefreshCw size={16} />
            Обновить
          </button>
        </div>
        <div className="admin-tools">
          <select value={orderStatus} onChange={(event) => { setOrderStatus(event.target.value); refreshOrders(event.target.value); }}>
            <option value="all">Все статусы</option>
            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="admin-table">
          {orders.length === 0 && <div className="empty-state"><h2>Заказов пока нет</h2><p>Оформите заказ в пользовательской части.</p></div>}
          {orders.map((order) => (
            <article className="admin-row order-row" key={order.id}>
              <div>
                <strong>{order.order_number}</strong>
                <span>{fixText(order.customer_name)} · {order.customer_phone} · {money.format(Number(order.total_amount || 0))}</span>
              </div>
              <select value={order.status} onChange={(event) => dispatch(changeOrderStatus({ id: order.id, status: event.target.value }))}>
                {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
