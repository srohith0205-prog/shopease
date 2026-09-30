import { useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Minus, Moon, Plus, Search, ShoppingBag, Sun } from 'lucide-react';

const API = 'https://fakestoreapi.com';
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const normalizeProduct = (product) => ({
  ...product,
  thumbnail: product.image || product.thumbnail,
  images: product.image ? [product.image] : product.images || [],
  rating: typeof product.rating === 'object' ? product.rating.rate : product.rating,
  stock: product.stock ?? 20,
});
const readCart = () => {
  try { return (JSON.parse(localStorage.getItem('shopease-cart')) || []).map(normalizeProduct); } catch { return []; }
};

export default function StoreApp() {
  const [cart, setCart] = useState(readCart);
  const [dark, setDark] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => { localStorage.setItem('shopease-cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, [dark]);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 1800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function addToCart(product) {
    setCart((items) => {
      const found = items.find((item) => item.id === product.id);
      return found
        ? items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, { ...product, quantity: 1 }];
    });
    setNotice('Added to your bag');
  }

  function updateQuantity(id, amount) {
    setCart((items) => items.map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0));
  }

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return <div className="store">
    <header className="store-header">
      <Link className="store-logo" to="/">shop<span>ease</span></Link>
      <nav><Link to="/">Shop</Link><Link to="/cart">Cart</Link></nav>
      <div className="store-actions">
        <button className="plain-icon" onClick={() => setDark((value) => !value)} aria-label="Toggle dark mode">{dark ? <Sun /> : <Moon />}</button>
        <Link className="bag-button" to="/cart"><ShoppingBag size={18} /><span>Bag</span><b>{count}</b></Link>
      </div>
    </header>
    <main className="store-main"><Routes>
      <Route path="/" element={<Shop addToCart={addToCart} />} />
      <Route path="/product/:id" element={<Product addToCart={addToCart} />} />
      <Route path="/cart" element={<Cart cart={cart} updateQuantity={updateQuantity} />} />
      <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} />} />
      <Route path="/success" element={<Success />} />
      <Route path="*" element={<Shop addToCart={addToCart} />} />
    </Routes></main>
    <footer className="store-footer"><Link className="store-logo" to="/">shop<span>ease</span></Link><span>Everyday finds, made simple.</span></footer>
    {notice && <div className="store-notice" role="status">{notice}</div>}
  </div>;
}

function Shop({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/products?limit=20`).then((response) => { if (!response.ok) throw new Error(); return response.json(); }),
      fetch(`${API}/products/categories`).then((response) => { if (!response.ok) throw new Error(); return response.json(); }),
    ])
      .then(([productData, categoryData]) => {
        setProducts(productData.map(normalizeProduct));
        setCategories(categoryData.map((name) => ({ slug: name, name })));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const visibleProducts = products
    .filter((product) => (!category || product.category === category)
      && (!search || `${product.title} ${product.description} ${product.category}`.toLowerCase().includes(search.toLowerCase())))
    .sort((first, second) => sort === 'price'
      ? first.price - second.price
      : sort === 'rating'
        ? second.rating - first.rating
        : first.id - second.id)
    .slice(0, 6);

  return <>
    <section className="welcome"><p className="kicker">A GOOD PLACE TO START</p><h1>Find something <em>good.</em></h1><p>Everyday products, all in one simple place.</p></section>
    <section className="shop-controls" aria-label="Product filters">
      <form className="search-box" onSubmit={(event) => { event.preventDefault(); setSearch(searchText.trim()); }}><Search size={17} /><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search products" aria-label="Search products" /><button aria-label="Submit search"><ArrowRight size={17} /></button></form>
      <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Choose category"><option value="">All categories</option>{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select>
      <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="">Featured</option><option value="rating">Top rated</option><option value="price">Price: low to high</option></select>
    </section>
    <section className="shop-results"><div className="results-heading"><h2>{search ? `Results for “${search}”` : category ? categories.find((item) => item.slug === category)?.name : 'Popular right now'}</h2><span>{loading ? 'Loading…' : `${visibleProducts.length} products`}</span></div>
      {loading ? <div className="product-grid">{Array.from({ length: 6 }, (_, index) => <div className="product-skeleton" key={index} />)}</div>
        : error ? <div className="message-box"><p>Couldn’t load products. Check your connection and try again.</p><button className="primary-button" onClick={() => window.location.reload()}>Retry</button></div>
          : visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => <article className="simple-product" key={product.id}><Link to={`/product/${product.id}`} className="simple-product-image"><img src={product.thumbnail} alt={product.title} loading="lazy" /></Link><div className="simple-product-info"><span>{product.category.replaceAll('-', ' ')}</span><Link to={`/product/${product.id}`}><h3>{product.title}</h3></Link><div className="simple-product-bottom"><strong>{money(product.price)}</strong><button onClick={() => addToCart(product)} aria-label={`Add ${product.title} to cart`}><Plus size={17} /></button></div></div></article>)}</div>
            : <div className="message-box"><h3>No products found</h3><p>Try another search or category.</p></div>}
    </section>
  </>;
}

function Product({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  useEffect(() => { fetch(`${API}/products/${id}`).then((response) => { if (!response.ok) throw new Error(); return response.json(); }).then((data) => setProduct(normalizeProduct(data))).catch(() => setProduct(null)); }, [id]);
  if (!product) return <div className="message-box">Loading product…</div>;
  return <section className="product-detail"><Link className="back-link" to="/"><ArrowLeft size={16} /> Back to products</Link><div className="product-detail-layout"><div className="detail-image"><img src={product.images?.[0] || product.thumbnail} alt={product.title} /></div><div className="detail-copy"><p className="kicker">{product.category}</p><h1>{product.title}</h1><p className="detail-rating">★ {product.rating} · {product.stock} in stock</p><p className="detail-price">{money(product.price)}</p><p className="detail-description">{product.description}</p><button className="primary-button" onClick={() => addToCart(product)}>Add to cart <ShoppingBag size={17} /></button></div></div></section>;
}

function Cart({ cart, updateQuantity }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!cart.length) return <div className="message-box empty-cart"><ShoppingBag size={27} /><h1>Your cart is empty</h1><p>Find something good to bring home.</p><Link className="primary-button" to="/">Browse products <ArrowRight size={16} /></Link></div>;
  return <section className="cart-page"><p className="kicker">YOUR PICKS</p><h1>Shopping cart</h1><div className="cart-layout"><div>{cart.map((item) => <article className="cart-row" key={item.id}><img src={item.thumbnail} alt={item.title} /><div className="cart-row-info"><h2>{item.title}</h2><span>{money(item.price)}</span><div className="quantity"><button onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity"><Minus size={14} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity"><Plus size={14} /></button></div></div><strong>{money(item.price * item.quantity)}</strong></article>)}</div><aside className="cart-summary"><h2>Order summary</h2><p><span>Subtotal</span><span>{money(total)}</span></p><p><span>Shipping</span><span>Free</span></p><p className="cart-total"><strong>Total</strong><strong>{money(total)}</strong></p><Link className="primary-button" to="/checkout">Checkout <ArrowRight size={16} /></Link></aside></div></section>;
}

function Checkout({ cart, setCart }) {
  const navigate = useNavigate();
  if (!cart.length) return <div className="message-box"><h1>Your cart is empty</h1><Link className="primary-button" to="/">Back to shop</Link></div>;
  return <section className="checkout-page"><p className="kicker">ONE LAST THING</p><h1>Checkout</h1><form onSubmit={(event) => { event.preventDefault(); setCart([]); navigate('/success'); }}><label>Name<input required autoComplete="name" /></label><label>Email<input type="email" required autoComplete="email" /></label><label>Delivery address<input required autoComplete="street-address" /></label><button className="primary-button">Place order <ArrowRight size={16} /></button><p className="checkout-note">Demo checkout. No payment is collected.</p></form></section>;
}

function Success() { return <div className="message-box"><p className="kicker">ORDER COMPLETE</p><h1>Thanks for your order!</h1><p>Your items are on their way.</p><Link className="primary-button" to="/">Continue shopping <ArrowRight size={16} /></Link></div>; }