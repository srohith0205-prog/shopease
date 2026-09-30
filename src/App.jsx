import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowDownUp, ArrowLeft, ArrowRight, Check, ChevronDown, Heart, Minus, Moon, Plus,
  Search, ShoppingBag, SlidersHorizontal, Sparkles, Sun, Trash2, UserRound, X,
} from 'lucide-react';

const API = 'https://dummyjson.com';
const money = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const readStore = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

function App() {
  const [cart, setCart] = useState(() => readStore('shopease-cart', []));
  const [wishlist, setWishlist] = useState(() => readStore('shopease-wishlist', []));
  const [dark, setDark] = useState(() => readStore('shopease-dark', false));
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  useEffect(() => { localStorage.setItem('shopease-cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('shopease-wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => {
    localStorage.setItem('shopease-dark', JSON.stringify(dark));
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const addToCart = (product, quantity = 1) => {
    setCart((items) => {
      const found = items.find((item) => item.id === product.id);
      return found
        ? items.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock || 99) } : item)
        : [...items, { ...product, quantity: Math.min(quantity, product.stock || 99) }];
    });
    setNotice(`${product.title} added to your bag`);
  };
  const changeQuantity = (id, delta) => setCart((items) => items
    .map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
    .filter((item) => item.quantity > 0));
  const removeFromCart = (id) => setCart((items) => items.filter((item) => item.id !== id));
  const toggleWishlist = (product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    setWishlist((items) => exists ? items.filter((item) => item.id !== product.id) : [...items, product]);
    setNotice(exists ? 'Removed from your wishlist' : 'Saved to your wishlist');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const shared = { cart, wishlist, addToCart, changeQuantity, removeFromCart, toggleWishlist, setNotice };
  return (
    <div className="app-shell">
      <div className="announcement"><Sparkles size={13} /> Thoughtfully picked. Happily delivered. <span>Free shipping on orders over $75</span></div>
      <header className="site-header">
        <Link className="wordmark" to="/" aria-label="ShopEase home">shop<span>ease</span><i>.</i></Link>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/products">Shop</NavLink>
          <NavLink to="/categories">Collections</NavLink>
          <a href="/products?sort=top-rated" onClick={(event) => { event.preventDefault(); navigate('/products?sort=top-rated'); }}>Our picks</a>
        </nav>
        <div className="header-actions">
          <Link className="icon-button header-search" to="/products" aria-label="Search products"><Search /></Link>
          <button className="icon-button theme-button" onClick={() => setDark((value) => !value)} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>{dark ? <Sun /> : <Moon />}</button>
          <Link className="icon-button wishlist-link" to="/wishlist" aria-label={`Wishlist, ${wishlist.length} items`}><Heart /><span className="action-count">{wishlist.length}</span></Link>
          <Link className="icon-button account-link" to="/account" aria-label="Sign in or create an account"><UserRound /></Link>
          <Link className="bag-link" to="/cart" aria-label={`Shopping bag, ${cartCount} items`}><ShoppingBag /><span>Bag</span><span className="bag-count">{cartCount}</span></Link>
        </div>
      </header>
      <main><Routes>
        <Route path="/" element={<Home {...shared} />} />
        <Route path="/products" element={<Catalog {...shared} />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/product/:id" element={<ProductDetail {...shared} />} />
        <Route path="/cart" element={<Cart {...shared} />} />
        <Route path="/wishlist" element={<Wishlist {...shared} />} />
        <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} setNotice={setNotice} />} />
        <Route path="/account" element={<Account />} />
        <Route path="/success" element={<OrderSuccess />} />
        <Route path="*" element={<NotFound />} />
      </Routes></main>
      <footer className="site-footer"><Link className="wordmark footer-mark" to="/">shop<span>ease</span><i>.</i></Link><span>Good things, well chosen.</span><span>© 2026 ShopEase</span></footer>
      {notice && <div className="toast" role="status"><Check size={16} /> {notice}</div>}
    </div>
  );
}

function Home({ addToCart, wishlist, toggleWishlist }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${API}/products?limit=4&sortBy=rating&order=desc`)
      .then((response) => { if (!response.ok) throw new Error('Could not load products'); return response.json(); })
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);
  return <>
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-rule" /> THE EVERYDAY, ELEVATED</p><h1>Good things.<br /><em>Well chosen.</em></h1><p className="hero-description">A little more joy in the things you use every day. Meet the pieces worth keeping.</p><Link className="button button-dark" to="/products">Explore the collection <ArrowRight size={17} /></Link><div className="hero-note"><span className="hero-note-number">01 / 04</span><span>Made for the way you live</span></div></div>
      <div className="hero-image" role="img" aria-label="Curated home and lifestyle products"><img src="https://cdn.dummyjson.com/products/images/home-decoration/Decoration%20Swing/1.png" alt="Sculptural home decor detail" /><div className="hero-image-label"><span>THE EDIT</span><b>Objects with a point of view</b></div><span className="hero-stamp">GOOD<br />BY<br />DESIGN</span></div>
    </section>
    <section className="values-strip"><span>Made to be used</span><i /><span>Chosen with care</span><i /><span>Easy on the everyday</span><i /><span>Always a good find</span></section>
    <section className="section collection-section"><div className="section-heading"><div><p className="eyebrow">A FEW THINGS WE LOVE</p><h2>The good stuff</h2></div><Link className="text-link" to="/products">See everything <ArrowRight size={16} /></Link></div>
      {loading ? <ProductGridSkeleton /> : products.length ? <ProductGrid products={products} wishlist={wishlist} addToCart={addToCart} toggleWishlist={toggleWishlist} /> : <LoadError />}
    </section>
    <section className="category-feature"><div className="category-feature-image"><img src="https://cdn.dummyjson.com/products/images/womens-bags/Prada%20Women%20Bag/1.png" alt="A considered accessory" /></div><div className="category-feature-copy"><p className="eyebrow">FIND YOUR EVERYDAY</p><h2>Little discoveries.<br /><em>Big good energy.</em></h2><p>From your morning ritual to the last thing you reach for at night, find something to make it feel a little better.</p><Link className="button button-outline" to="/categories">Browse by category <ArrowRight size={17} /></Link></div></section>
  </>;
}

function Catalog({ addToCart, wishlist, toggleWishlist }) {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const search = params.get('q') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || '';
  const [draftSearch, setDraftSearch] = useState(search);
  useEffect(() => { setDraftSearch(search); }, [search]);
  useEffect(() => {
    const endpoint = category
      ? `${API}/products/category/${encodeURIComponent(category)}`
      : search
        ? `${API}/products/search?q=${encodeURIComponent(search)}`
        : `${API}/products`;
    const sortBy = sort === 'price-low' || sort === 'price-high' ? 'price' : sort === 'top-rated' ? 'rating' : sort === 'newest' ? 'id' : '';
    const order = sort === 'price-low' ? 'asc' : 'desc';
    const query = new URLSearchParams({ limit: '8' });
    if (sortBy) { query.set('sortBy', sortBy); query.set('order', order); }
    setLoading(true);
    Promise.all([
      fetch(`${endpoint}?${query}`).then((response) => { if (!response.ok) throw new Error(); return response.json(); }),
      fetch(`${API}/products/categories`).then((response) => { if (!response.ok) throw new Error(); return response.json(); }),
    ]).then(([productData, categoryData]) => { setProducts(productData.products || []); setCategories(categoryData || []); setError(false); })
      .catch(() => setError(true)).finally(() => setLoading(false));
  }, [category, search, sort]);
  const filtered = useMemo(() => {
    let result = products.filter((product) => (!category || product.category === category)
      && (!search || `${product.title} ${product.brand || ''} ${product.description}`.toLowerCase().includes(search.toLowerCase())));
    return result;
  }, [products, category, search, sort]);
  const shown = filtered;
  const update = (key, value) => setParams((current) => { const next = new URLSearchParams(current); value ? next.set(key, value) : next.delete(key); next.delete('page'); return next; });
  const submitSearch = (event) => { event.preventDefault(); update('q', draftSearch.trim()); };
  return <section className="catalog-page page-wrap">
    <div className="page-intro"><p className="eyebrow">THE SHOP</p><h1>Find your <em>something.</em></h1><p>Everyday favorites, a few unexpected finds, and all the good stuff in between.</p></div>
    <form className="catalog-search" onSubmit={submitSearch}><Search size={18} /><input aria-label="Search products" placeholder="Search products, brands, little obsessions..." value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} /><button type="submit">Search <ArrowRight size={15} /></button></form>
    <div className="catalog-toolbar"><div className="filter-label"><SlidersHorizontal size={15} /><span>FILTER BY</span></div><div className="category-chips"><button className={!category ? 'chip active' : 'chip'} onClick={() => update('category', '')}>Everything</button>{categories.slice(0, 9).map((item) => <button key={item.slug} className={category === item.slug ? 'chip active' : 'chip'} onClick={() => update('category', item.slug)}>{item.name}</button>)}</div><label className="sort-control"><ArrowDownUp size={14} /><span className="sort-label">Sort</span><select aria-label="Sort products" value={sort} onChange={(event) => update('sort', event.target.value)}><option value="">Featured</option><option value="top-rated">Top rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="newest">Newest</option></select><ChevronDown size={13} /></label></div>
    <div className="result-line"><span>{loading ? 'Finding good things...' : `${filtered.length} ${filtered.length === 1 ? 'find' : 'finds'}`}</span>{search && <button onClick={() => { update('q', ''); setDraftSearch(''); }}>Clear “{search}” <X size={13} /></button>}</div>
    {loading ? <ProductGridSkeleton /> : error ? <LoadError /> : shown.length ? <ProductGrid products={shown} wishlist={wishlist} addToCart={addToCart} toggleWishlist={toggleWishlist} /> : <div className="empty-state"><span className="empty-icon"><Search /></span><h2>Nothing found this time.</h2><p>Try a different search or start fresh.</p><button className="button button-dark" onClick={() => { setDraftSearch(''); setParams({}); }}>Reset filters</button></div>}
  </section>;
}

function ProductGrid({ products, wishlist, addToCart, toggleWishlist }) {
  return <div className="product-grid">{products.map((product, index) => <article className="product-card" key={product.id} style={{ '--card-index': index }}><div className="product-visual"><Link to={`/product/${product.id}`} aria-label={`View ${product.title}`}><img src={product.thumbnail || product.images?.[0]} alt={product.title} loading="lazy" /></Link><span className="product-badge">{product.discountPercentage > 12 ? `−${Math.round(product.discountPercentage)}%` : product.rating >= 4.7 ? 'A good find' : product.brand || 'JUST IN'}</span><button className={`favorite-button ${wishlist.some((item) => item.id === product.id) ? 'is-favorite' : ''}`} aria-label={wishlist.some((item) => item.id === product.id) ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`} onClick={() => toggleWishlist(product)}><Heart size={17} fill={wishlist.some((item) => item.id === product.id) ? 'currentColor' : 'none'} /></button><button className="quick-add" onClick={() => addToCart(product)}><Plus size={14} /> Add to bag</button></div><div className="product-meta"><span className="product-category">{product.category?.replaceAll('-', ' ')}</span><span className="product-rating">★ {Number(product.rating).toFixed(1)}</span></div><Link className="product-name" to={`/product/${product.id}`}>{product.title}</Link><div className="product-price">{money(product.price)}{product.discountPercentage > 0 && <s>{money(product.price / (1 - product.discountPercentage / 100))}</s>}</div></article>)}</div>;
}

function ProductGridSkeleton() { return <div className="product-grid">{Array.from({ length: 4 }, (_, index) => <div className="skeleton-card" key={index}><div className="skeleton-image" /><div className="skeleton-line" /><div className="skeleton-line short" /></div>)}</div>; }
function LoadError() { return <div className="empty-state"><span className="empty-icon"><ShoppingBag /></span><h2>We couldn't reach the shop.</h2><p>Check your connection and try again.</p><button className="button button-dark" onClick={() => window.location.reload()}>Try again <ArrowRight size={16} /></button></div>; }

function Pagination({ page, count, onChange }) { return count > 1 && <nav className="pagination" aria-label="Product pages"><button aria-label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)}><ArrowLeft size={15} /></button>{Array.from({ length: count }, (_, index) => index + 1).map((number) => <button className={page === number ? 'current' : ''} key={number} onClick={() => onChange(number)}>{number}</button>)}<button aria-label="Next page" disabled={page === count} onClick={() => onChange(page + 1)}><ArrowRight size={15} /></button></nav>; }

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch(`${API}/products/categories`).then((response) => response.json()).then(setCategories).catch(() => setCategories([])).finally(() => setLoading(false)); }, []);
  const categoryImages = ['https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/1.png','https://cdn.dummyjson.com/products/images/furniture/Annibale%20Colombo%20Bed/1.png','https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/1.png','https://cdn.dummyjson.com/products/images/mens-shirts/Blue%20&%20Black%20Check%20Shirt/1.png'];
  return <section className="categories-page page-wrap"><div className="page-intro"><p className="eyebrow">A PLACE FOR EVERYTHING</p><h1>Browse the <em>good bits.</em></h1><p>Start with what you love. We'll take it from there.</p></div>{loading ? <ProductGridSkeleton /> : <div className="category-grid">{categories.map((category, index) => <Link key={category.slug} className="category-tile" to={`/products?category=${encodeURIComponent(category.slug)}`}><div className={`category-tile-image category-art-${index % 4}`}><img src={categoryImages[index % categoryImages.length]} alt="" loading="lazy" /><span>{String(index + 1).padStart(2, '0')}</span></div><div className="category-tile-caption"><h2>{category.name}</h2><ArrowRight size={17} /></div></Link>)}</div>}</section>;
}

function ProductDetail({ addToCart, wishlist, toggleWishlist }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  useEffect(() => { setLoading(true); fetch(`${API}/products/${id}`).then((response) => { if (!response.ok) throw new Error(); return response.json(); }).then(setProduct).catch(() => setProduct(null)).finally(() => setLoading(false)); }, [id]);
  if (loading) return <div className="detail-loading page-wrap"><ProductGridSkeleton /></div>;
  if (!product) return <LoadError />;
  const saved = wishlist.some((item) => item.id === product.id);
  return <section className="detail-page page-wrap"><Link className="back-link" to="/products"><ArrowLeft size={15} /> Back to the shop</Link><div className="detail-layout"><div className="detail-gallery"><div className="detail-main-image"><img src={product.images?.[0] || product.thumbnail} alt={product.title} /></div><div className="detail-thumbnails">{(product.images || [product.thumbnail]).slice(0, 4).map((image, index) => <div className="detail-thumb" key={image}><img src={image} alt={`${product.title}, view ${index + 1}`} /></div>)}</div></div><div className="detail-info"><p className="eyebrow">{product.brand || product.category?.replaceAll('-', ' ')}</p><h1>{product.title}</h1><div className="detail-rating"><span>★ {Number(product.rating).toFixed(1)}</span><span>·</span><span>{product.stock > 0 ? `${product.stock} ready to ship` : 'Currently unavailable'}</span></div><div className="detail-price">{money(product.price)}{product.discountPercentage > 0 && <span className="discount-note">Save {Math.round(product.discountPercentage)}%</span>}</div><p className="detail-description">{product.description}</p><div className="detail-stock"><span className={product.stock > 0 ? 'stock-dot' : 'stock-dot out'} />{product.stock > 0 ? 'In stock and ready to go' : 'Out of stock'}</div><div className="detail-buy-row"><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(product.stock || 1, value + 1))}><Plus size={14} /></button></div><button className="button button-dark add-detail" disabled={!product.stock} onClick={() => addToCart(product, quantity)}>Add to bag <span>{money(product.price * quantity)}</span></button><button className={`detail-heart ${saved ? 'is-favorite' : ''}`} aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'} onClick={() => toggleWishlist(product)}><Heart size={19} fill={saved ? 'currentColor' : 'none'} /></button></div><div className="detail-perks"><span><Check size={15} /> Free shipping over $75</span><span><Check size={15} /> Easy 30-day returns</span><span><Check size={15} /> A little joy, guaranteed</span></div><details className="detail-accordion"><summary>Details & care <Plus size={15} /></summary><p>{product.description} {product.warrantyInformation || 'Made for everyday use.'}</p></details></div></div></section>;
}

function Cart({ cart, changeQuantity, removeFromCart }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 6.95;
  if (!cart.length) return <EmptyCollection title="Your bag's taking a break." text="There's plenty more to discover." action="Go find something" to="/products" />;
  return <section className="cart-page page-wrap"><div className="page-intro compact-intro"><p className="eyebrow">THE GOOD STUFF, TOGETHER</p><h1>Your <em>bag.</em></h1><p>{cart.reduce((sum, item) => sum + item.quantity, 0)} thoughtful little {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'find' : 'finds'}.</p></div><div className="cart-layout"><div className="cart-items">{cart.map((item) => <article className="cart-item" key={item.id}><Link className="cart-item-image" to={`/product/${item.id}`}><img src={item.thumbnail} alt={item.title} /></Link><div className="cart-item-info"><span className="product-category">{item.category?.replaceAll('-', ' ')}</span><Link to={`/product/${item.id}`}>{item.title}</Link><span className="cart-unit">{money(item.price)} each</span><div className="quantity-control"><button aria-label={`Remove one ${item.title}`} onClick={() => changeQuantity(item.id, -1)}><Minus size={13} /></button><span>{item.quantity}</span><button aria-label={`Add one ${item.title}`} onClick={() => changeQuantity(item.id, 1)}><Plus size={13} /></button></div></div><div className="cart-item-end"><strong>{money(item.price * item.quantity)}</strong><button className="remove-button" aria-label={`Remove ${item.title}`} onClick={() => removeFromCart(item.id)}><Trash2 size={15} /> Remove</button></div></article>)}</div><aside className="order-summary"><p className="eyebrow">THE NUMBERS</p><h2>Order summary</h2><div><span>Subtotal</span><span>{money(subtotal)}</span></div><div><span>Shipping</span><span>{shipping ? money(shipping) : 'On us'}</span></div>{subtotal < 75 && <p className="shipping-hint">You're {money(75 - subtotal)} away from free shipping.</p>}<div className="summary-total"><strong>Total</strong><strong>{money(subtotal + shipping)}</strong></div><Link className="button button-dark checkout-button" to="/checkout">Continue to checkout <ArrowRight size={16} /></Link><Link className="continue-link" to="/products">Keep looking around</Link></aside></div></section>;
}

function Wishlist({ wishlist, addToCart, toggleWishlist }) { return wishlist.length ? <section className="wishlist-page page-wrap"><div className="page-intro compact-intro"><p className="eyebrow">SAVED FOR A GOOD DAY</p><h1>Your <em>wishlist.</em></h1><p>A little collection of things you've had your eye on.</p></div><ProductGrid products={wishlist} wishlist={wishlist} addToCart={addToCart} toggleWishlist={toggleWishlist} /></section> : <EmptyCollection title="A little room for inspiration." text="Save your favorites here while you browse." action="Explore the shop" to="/products" />; }

function EmptyCollection({ title, text, action, to }) { return <section className="empty-state page-wrap"><span className="empty-icon"><Heart /></span><p className="eyebrow">NOTHING HERE (YET)</p><h1>{title}</h1><p>{text}</p><Link className="button button-dark" to={to}>{action} <ArrowRight size={16} /></Link></section>; }

function Checkout({ cart, setCart, setNotice }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 75 ? 0 : 6.95;
  const submit = async (event) => {
    event.preventDefault(); setSubmitting(true); setError('');
    try {
      const response = await fetch(`${API}/carts/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: 1, products: cart.map(({ id, quantity }) => ({ id, quantity })) }) });
      if (!response.ok) throw new Error('Please check your connection and try again.');
      const order = await response.json();
      sessionStorage.setItem('shopease-order', JSON.stringify({ id: order.id, total: subtotal + shipping, count: cart.reduce((sum, item) => sum + item.quantity, 0) }));
      setCart([]); setNotice('Order placed successfully'); navigate('/success');
    } catch { setError('We couldn’t place your order. Please check your connection and try again.'); }
    finally { setSubmitting(false); }
  };
  if (!cart.length) return <EmptyCollection title="Nothing to check out." text="Your bag is waiting for a good find." action="Back to the shop" to="/products" />;
  return <section className="checkout-page page-wrap"><Link className="back-link" to="/cart"><ArrowLeft size={15} /> Back to your bag</Link><div className="checkout-layout"><div><div className="page-intro compact-intro"><p className="eyebrow">ALMOST YOURS</p><h1>Let's make it <em>official.</em></h1></div><form className="checkout-form" onSubmit={submit}><h2>Where should we send the good stuff?</h2><div className="form-grid"><label>First name<input required name="firstName" autoComplete="given-name" /></label><label>Last name<input required name="lastName" autoComplete="family-name" /></label><label className="full-field">Email address<input required name="email" type="email" autoComplete="email" /></label><label className="full-field">Street address<input required name="address" autoComplete="street-address" /></label><label>City<input required name="city" autoComplete="address-level2" /></label><label>ZIP code<input required name="zip" autoComplete="postal-code" /></label></div><h2 className="payment-title">Payment details</h2><div className="form-grid"><label className="full-field">Card number<input required inputMode="numeric" minLength="12" maxLength="19" placeholder="4242 4242 4242 4242" /></label><label>Expiry date<input required placeholder="MM / YY" maxLength="7" /></label><label>Security code<input required inputMode="numeric" minLength="3" maxLength="4" placeholder="CVC" /></label></div><p className="demo-notice">Demo checkout. Use any valid-looking details; no payment is processed.</p>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark place-order" disabled={submitting}>{submitting ? 'Placing your order...' : <>Place your order <ArrowRight size={16} /></>}</button></form></div><aside className="checkout-recap"><p className="eyebrow">IN YOUR BAG</p>{cart.map((item) => <div className="recap-item" key={item.id}><img src={item.thumbnail} alt="" /><span>{item.title} <small>× {item.quantity}</small></span><strong>{money(item.price * item.quantity)}</strong></div>)}<div className="recap-line"><span>Shipping</span><span>{shipping ? money(shipping) : 'On us'}</span></div><div className="recap-line recap-total"><strong>Total</strong><strong>{money(subtotal + shipping)}</strong></div></aside></div></section>;
}

function Account() {
  const [mode, setMode] = useState('login');
  const [submitted, setSubmitted] = useState(false);
  const submit = (event) => { event.preventDefault(); setSubmitted(true); };
  return <section className="account-page page-wrap"><div className="account-panel"><p className="eyebrow">YOUR LITTLE CORNER</p><h1>{mode === 'login' ? <>Welcome <em>back.</em></> : <>Make it <em>yours.</em></>}</h1><p className="account-lede">{mode === 'login' ? 'Good to see you again.' : 'A home for your favorite finds and order updates.'}</p><div className="account-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setSubmitted(false); }}>Sign in</button><button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setSubmitted(false); }}>Create account</button></div>{submitted ? <div className="account-success"><Check /><h2>{mode === 'login' ? 'You’re all set.' : 'Welcome to ShopEase.'}</h2><p>This demo account form is ready for a real sign-in service.</p><Link className="button button-dark" to="/products">Back to the shop</Link></div> : <form className="account-form" onSubmit={submit}>{mode === 'register' && <label>Your name<input required autoComplete="name" /></label>}<label>Email address<input required type="email" autoComplete="email" /></label><label>Password<input required type="password" minLength="6" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label><button className="button button-dark">{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></button><p className="demo-notice">Demo account experience. No password is stored or sent.</p></form>}</div></section>;
}

function OrderSuccess() {
  const order = readStore('shopease-last-order', null) || (() => { try { return JSON.parse(sessionStorage.getItem('shopease-order')); } catch { return null; } })();
  return <section className="success-page page-wrap"><div className="success-mark"><Check size={28} /></div><p className="eyebrow">THAT'S A WRAP</p><h1>Good things are <em>on their way.</em></h1><p className="success-description">Thanks for choosing ShopEase. Your order is in, and the good stuff is getting ready to come home.</p>{order && <div className="order-number">ORDER #{order.id || 'SE-2026'} <span>{order.count || ''} items · {money(order.total || 0)}</span></div>}<Link className="button button-dark" to="/products">Back to the shop <ArrowRight size={16} /></Link><div className="success-art"><span>GOOD<br />THINGS<br />TAKE TIME</span><span className="success-art-circle" /></div></section>;
}

function NotFound() { return <EmptyCollection title="We can't find that page." text="Let's get you back to the good stuff." action="Go to the shop" to="/products" />; }

export default App;