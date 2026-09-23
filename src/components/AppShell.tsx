import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const NAV = [
  { to: '/', label: 'Texts', end: true },
  { to: '/progress', label: 'Progress', end: false },
  { to: '/settings', label: 'Settings', end: false },
];

export function AppShell() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const first = useRef(true);

  // Announce page changes to screen readers and start each page at the top.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    mainRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    const h1 = mainRef.current?.querySelector('h1')?.textContent;
    document.title = h1 ? `${h1} · DeuLern Lese Reise` : 'DeuLern Lese Reise';
  });

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="app-header">
        <div className="app-header__inner">
          <NavLink to="/" className="app-brand">
            Deu<span className="app-brand__accent">Lern</span> Lese Reise
            <span className="app-brand__subtitle">German reading, A1–B1</span>
          </NavLink>
          <nav className="app-nav" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className="app-nav__link">
                {n.label}
              </NavLink>
            ))}
          </nav>
          <a
            className="button button--secondary app-header__home"
            href="https://deulern.com"
          >
            deulern.com
          </a>
        </div>
      </header>

      <main className="app-main" id="main-content" tabIndex={-1} ref={mainRef}>
        <div className="app-main__inner">
          <Outlet />
        </div>
      </main>

      <footer className="app-footer">
        <div className="app-footer__inner">
          <p className="app-footer__note">
            Lese Reise is part of <a href="https://deulern.com">DeuLern</a>, where you can
            find more apps for learning German: vocabulary, verbs and grammar. All texts
            are written for this app. Your progress is stored only in this browser.
          </p>
        </div>
      </footer>
    </div>
  );
}
