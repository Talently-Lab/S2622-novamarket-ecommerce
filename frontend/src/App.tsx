import { Provider } from './components/ui/provider.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { AppRoutes } from './routes/AppRoutes.tsx';

export default function App() {
  return (
    <Provider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </Provider>
  );
}
