import { DAY, queryClient } from './queryClient';

describe('queryClient', () => {
  it('configura gcTime alto (persistência offline) e staleTime', () => {
    const q = queryClient.getDefaultOptions().queries;
    expect(q?.gcTime).toBe(DAY * 7);
    expect(q?.staleTime).toBe(1000 * 60 * 5);
    expect(q?.retry).toBe(false);
  });
});
