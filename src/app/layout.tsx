export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ maxWidth: 720, margin: '20px auto', padding: 16 }}>
          <h1>SAM Alerts</h1>
          {children}
        </div>
      </body>
    </html>
  );
}