# ShopEase

A simple React storefront powered by the [Fake Store API](https://fakestoreapi.com/). Products, categories, and product details load from the API. Cart and theme preferences are saved in the browser.

## Run locally

```sh
npm install
npm run dev
```

Vite prints the local development URL after the server starts. Create a production build with `npm run build`.

## Included

- Product catalog, product details, cart, and demo checkout
- Product search, category filters, and price/rating sorting over the API catalog
- Persistent cart and light/dark theme
- No payment is processed

The catalog requires an internet connection to reach Fake Store API and load product images. Its product search and sorting are handled in the browser because the API does not provide search or price-sorting endpoints.