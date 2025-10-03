import { createFileRoute, useNavigate } from '@tanstack/react-router';
import '../index.css';

function CatchAllNotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Try to go back in history, otherwise go to login
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: '/login' });
    }
  };

  return (
    <div style={{ 
      padding: '60px 40px', 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '500px' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          404
        </h1>
        <h2 style={{ 
          fontSize: '1.5rem', 
          color: '#6b7280',
          marginBottom: '1rem'
        }}>
          Page Not Found
        </h2>
        <p style={{ 
          color: '#9ca3af',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleGoBack}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Go Back
          </button>
          <button
            onClick={() => navigate({ to: '/login' })}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#3b82f6',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/$')({
  component: CatchAllNotFound,
});
