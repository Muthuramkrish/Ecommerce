import Root from './pages/Root';
import { useAppInitialization, useAppTheme, useAppPerformance } from './App.load.js';

function App() {
  // Initialize app-wide functionality
  useAppInitialization();
  const { setTheme } = useAppTheme();
  useAppPerformance();

  return (
    <>
      <Root />
    </>
  );
}

export default App;