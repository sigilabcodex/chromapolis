import { HomePage } from './pages/HomePage';
import { ComparePage } from './pages/ComparePage';

function AppNav() {
  return (
    <nav className="top-nav" aria-label="Primary">
      <a href="/">Home</a>
      <a href="/compare">Compare Cities</a>
    </nav>
  );
}

export default function App() {
  const path = window.location.pathname;

  return (
    <>
      <AppNav />
      {path === '/compare' ? <ComparePage /> : <HomePage />}
    </>
  );
}
