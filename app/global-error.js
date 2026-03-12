"use client";

export default function GlobalError({ error, reset }) {
  // @TODO: Swap console.error for Sentry later
  console.error("Global Error Caught:", error);

  return (
    <html>
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong globally!</h2>
          <p>An unexpected critical error occurred.</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={() => reset()}
              style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
            >
              Try again
            </button>
            <a
              href="/dashboard"
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                background: '#000',
                color: '#fff',
                textDecoration: 'none',
              }}
            >
              Go to dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
