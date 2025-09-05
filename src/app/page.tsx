export default function HomePage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>SAM Contract Digest</h1>
      <p>System is running. Cron job executes daily at 1 PM UTC.</p>
      <p><a href="/api/health">Check Health</a></p>
    </div>
  );
}
