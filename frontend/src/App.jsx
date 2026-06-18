import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes.jsx';

function App() {
  useEffect(() => {
    document.title = 'TravelTest';
  }, []);

  return <AppRoutes />;
}

export default App;
