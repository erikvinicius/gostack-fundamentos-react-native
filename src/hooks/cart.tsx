import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const cart = await AsyncStorage.getItem('@GoMarketplace:Products');
      if (!cart) {
        return;
      }
      setProducts(JSON.parse(cart));
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const findProduct = products.find(
        listProduct => listProduct.id === product.id,
      );
      if (findProduct) {
        const newProducts = products.map(listProduct => {
          if (listProduct.id === product.id) {
            listProduct.quantity += 1;
          }
          return listProduct;
        });
        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:Products',
          JSON.stringify(newProducts),
        );
        return;
      }
      product.quantity = 1;
      setProducts([...products, product]);
      await AsyncStorage.setItem(
        '@GoMarketplace:Products',
        JSON.stringify([...products, product]),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const newProducts = products.map(product => {
        if (product.id === id) {
          product.quantity += 1;
        }
        return product;
      });
      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:Products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      let invalidProduct = false;
      const newProducts = products.map(product => {
        if (product.id === id) {
          if (product.quantity >= 1) {
            product.quantity -= 1;
          }
          if (product.quantity <= 0) invalidProduct = true;
          return product;
        }
        return product;
      });
      if (invalidProduct) {
        const filteredProducts = newProducts.filter(
          product => product.id !== id,
        );
        setProducts(filteredProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:Products',
          JSON.stringify(filteredProducts),
        );
        return;
      }
      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:Products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
