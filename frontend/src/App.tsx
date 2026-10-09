import { Provider } from './components/ui/provider.tsx';
import { AppRoutes } from './routes/AppRoutes.tsx';

export default function App() {
  return (
    <Provider>
      <AppRoutes />
    </Provider>
  );
}
