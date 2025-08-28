export const isAuthenticated = (): boolean => {
  // In a real app, this would check JWT tokens or session
  if (typeof window !== 'undefined') {
    return localStorage.getItem('wallet_connected') === 'true';
  }
  return false;
};

export const setAuthenticated = (value: boolean): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('wallet_connected', value.toString());
  }
};