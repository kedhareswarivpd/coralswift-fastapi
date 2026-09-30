import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import useApiResource from '../useApiResource.js';

describe('useApiResource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with loading state and fallback data', () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: [] });
    const fallback = [{ id: 1, name: 'Fallback' }];

    const { result } = renderHook(() => useApiResource(fetchFn, (x) => x, fallback));

    expect(result.current.loading).toBe(true);
    expect(result.current.items).toEqual(fallback);
    expect(result.current.isFallback).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('returns adapted data on successful fetch', async () => {
    const apiData = [{ id: 1, name: 'API Item' }];
    const fetchFn = vi.fn().mockResolvedValue({ data: apiData });
    const adapt = (item) => ({ ...item, adapted: true });
    const fallback = [];

    const { result } = renderHook(() => useApiResource(fetchFn, adapt, fallback));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.items).toEqual([{ id: 1, name: 'API Item', adapted: true }]);
    expect(result.current.isFallback).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns fallback data when API returns empty array', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: [] });
    const fallback = [{ id: 1, name: 'Demo' }];

    const { result } = renderHook(() => useApiResource(fetchFn, (x) => x, fallback));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.items).toEqual(fallback);
    expect(result.current.isFallback).toBe(true);
  });

  it('returns fallback data on fetch error', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));
    const fallback = [{ id: 1, name: 'Fallback' }];

    const { result } = renderHook(() => useApiResource(fetchFn, (x) => x, fallback));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.items).toEqual(fallback);
    expect(result.current.isFallback).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('handles null payload gracefully', async () => {
    const fetchFn = vi.fn().mockResolvedValue(null);
    const fallback = [{ id: 1 }];

    const { result } = renderHook(() => useApiResource(fetchFn, (x) => x, fallback));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.items).toEqual(fallback);
    expect(result.current.isFallback).toBe(true);
  });

  it('refetches when dependencies change', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: [] });
    const fallback = [];

    const { rerender } = renderHook(
      ({ deps }) => useApiResource(fetchFn, (x) => x, fallback, deps),
      { initialProps: { deps: [1] } }
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);

    await act(async () => {
      rerender({ deps: [2] });
    });

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('does not update state if fetch was cancelled', async () => {
    let resolveFetch;
    const fetchFn = vi.fn().mockImplementation(
      () => new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );
    const fallback = [];

    const { result, unmount } = renderHook(() =>
      useApiResource(fetchFn, (x) => x, fallback)
    );

    unmount();

    resolveFetch({ data: [{ id: 1 }] });

    expect(result.current.items).toEqual(fallback);
  });
});
