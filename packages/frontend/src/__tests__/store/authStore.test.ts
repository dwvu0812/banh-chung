import { useAuthStore } from '@/store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('initializes with null tokens', () => {
    const { accessToken, refreshToken } = useAuthStore.getState();
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
  });

  it('sets tokens correctly', () => {
    const { setTokens } = useAuthStore.getState();
    setTokens('access123', 'refresh456');

    const { accessToken, refreshToken } = useAuthStore.getState();
    expect(accessToken).toBe('access123');
    expect(refreshToken).toBe('refresh456');
  });

  it('clears tokens on logout', () => {
    const { setTokens, logout } = useAuthStore.getState();
    setTokens('access123', 'refresh456');

    logout();

    const { accessToken, refreshToken } = useAuthStore.getState();
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
  });
});

