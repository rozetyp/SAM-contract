// Simple dev feed functionality for webhook events
export function addDevEvent(event: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Dev Event:', event);
  }
  // In production, this is a no-op for now
  return Promise.resolve();
}
