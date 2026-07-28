import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useMember } from '@/hooks/useMember';
import * as memberApi from '@/api/member.api';
import { memberFixture } from '@/model/member.fixture';

jest.mock('@/api/member.api');
const mockedGetMe = memberApi.getMe as jest.MockedFunction<
  typeof memberApi.getMe
>;

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => jest.clearAllMocks());

describe('useMember', () => {
  it('sucesso: retorna os dados do membro', async () => {
    mockedGetMe.mockResolvedValue(memberFixture);
    const { result } = renderHook(() => useMember(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.nomeCompleto).toBe('Lucas de Souza Conceição');
  });

  it('erro (ex.: 401): expõe isError e não retorna dados', async () => {
    mockedGetMe.mockRejectedValue({ response: { status: 401 } });
    const { result } = renderHook(() => useMember(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
