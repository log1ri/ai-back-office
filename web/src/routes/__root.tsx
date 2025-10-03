import { createRootRoute, Outlet } from "@tanstack/react-router"
import "../index.css"
import { AuthProvider } from "../contexts/AuthContext"

function NotFoundComponent() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/login" style={{ color: '#007bff', textDecoration: 'underline' }}>
        Go back to login
      </a>
    </div>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ({ error }) => (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>Something went wrong!</h1>
      <p>{error?.message || 'An unexpected error occurred'}</p>
      <a href="/login" style={{ color: '#007bff', textDecoration: 'underline' }}>
        Go back to login
      </a>
    </div>
  ),
});
