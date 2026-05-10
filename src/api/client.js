const PRODUCT_API = import.meta.env.VITE_PRODUCT_API || 'http://127.0.0.1:18001';
const ORDER_API = import.meta.env.VITE_ORDER_API || 'http://127.0.0.1:18002';
const ADMIN_API = import.meta.env.VITE_ADMIN_API || 'http://127.0.0.1:18003';

const mojibakePattern = /[ÐÑ]/;

export function fixText(value) {
  if (typeof value !== 'string' || !mojibakePattern.test(value)) return value;
  try {
    const bytes = Uint8Array.from([...value].map((char) => char.charCodeAt(0)));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return value;
  }
}

export function normalizeProduct(product) {
  const mainImage = product.images?.find((image) => image.is_main) || product.images?.[0];
  return {
    id: product.id,
    sku: product.sku,
    name: fixText(product.name),
    slug: product.slug,
    type: fixText(product.lamp_type || product.category?.name || product.series || product.brand || 'Лампа'),
    brand: fixText(product.brand || ''),
    series: fixText(product.series || ''),
    categoryId: product.category_id,
    baseType: product.base_type,
    wattage: product.wattage,
    colorTemperature: product.color_temperature,
    luminousFlux: product.luminous_flux,
    voltage: product.voltage,
    lifetimeHours: product.lifetime_hours,
    price: Number(product.price),
    stockQty: product.stock_qty,
    isActive: product.is_active,
    isNew: true,
    shortDescription: fixText(product.short_description),
    description: fixText(product.description),
    image: mainImage?.image_url || 'https://placehold.co/800x600?text=Lamp',
    images: product.images || [],
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

export function normalizeCategory(category) {
  return {
    id: category.id,
    name: fixText(category.name),
    slug: category.slug,
    description: fixText(category.description),
    isActive: category.is_active,
  };
}

export function productToApi(product) {
  return {
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    short_description: product.shortDescription,
    description: product.description,
    category_id: product.categoryId,
    price: Number(product.price),
    stock_qty: Number(product.stockQty),
    wattage: Number(product.wattage),
    base_type: product.baseType,
    color_temperature: Number(product.colorTemperature),
    luminous_flux: Number(product.luminousFlux),
    voltage: Number(product.voltage),
    lifetime_hours: Number(product.lifetimeHours),
    brand: product.brand,
    series: product.series,
    is_active: Boolean(product.isActive),
    images: product.image
      ? [{ image_url: product.image, alt_text: product.name, sort_order: 0, is_main: true }]
      : [],
  };
}

async function request(baseUrl, path, options = {}) {
  const { token, query, ...fetchOptions } = options;
  const url = new URL(path, baseUrl);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  });

  if (response.status === 204) return null;
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.error?.message || `HTTP ${response.status}`);
  }
  return payload;
}

export const api = {
  listCategories: () => request(PRODUCT_API, '/api/v1/categories'),
  listProducts: (query) => request(PRODUCT_API, '/api/v1/products', { query }),
  getProduct: (id) => request(PRODUCT_API, `/api/v1/products/${id}`),
  createOrder: (body) => request(ORDER_API, '/api/v1/orders', { method: 'POST', body: JSON.stringify(body) }),
  getOrder: (orderNumber) => request(ORDER_API, `/api/v1/orders/${orderNumber}`),
  login: (body) => request(ADMIN_API, '/api/v1/admin/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: (token) => request(ADMIN_API, '/api/v1/admin/auth/logout', { method: 'POST', token }),
  me: (token) => request(ADMIN_API, '/api/v1/admin/me', { token }),
  dashboard: (token) => request(ADMIN_API, '/api/v1/admin/dashboard/summary', { token }),
  adminProducts: (token, query) => request(ADMIN_API, '/api/v1/admin/products', { token, query }),
  createProduct: (token, body) =>
    request(ADMIN_API, '/api/v1/admin/products', { method: 'POST', token, body: JSON.stringify(body) }),
  patchProduct: (token, id, body) =>
    request(ADMIN_API, `/api/v1/admin/products/${id}`, { method: 'PATCH', token, body: JSON.stringify(body) }),
  deleteProduct: (token, id) => request(ADMIN_API, `/api/v1/admin/products/${id}`, { method: 'DELETE', token }),
  adminOrders: (token, query) => request(ADMIN_API, '/api/v1/admin/orders', { token, query }),
  patchOrderStatus: (token, id, body) =>
    request(ADMIN_API, `/api/v1/admin/orders/${id}/status`, { method: 'PATCH', token, body: JSON.stringify(body) }),
  patchOrderComment: (token, id, body) =>
    request(ADMIN_API, `/api/v1/admin/orders/${id}/comment`, { method: 'PATCH', token, body: JSON.stringify(body) }),
};
