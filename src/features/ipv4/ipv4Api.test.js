import { afterEach, describe, expect, it, vi } from 'vitest';
import { getUserSubnetworks, saveSubnetwork } from './ipv4Api';

afterEach(() => vi.unstubAllGlobals());

describe('IPv4 API', () => {
  it('loads only subnetworks associated with the requested user', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);

    await getUserSubnetworks('user-7');

    expect(fetchMock.mock.calls[0][0]).toContain('/subnetworks?userId=user-7');
  });

  it('persists a subnetwork with its owning user id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'sub-1' }) });
    vi.stubGlobal('fetch', fetchMock);

    await saveSubnetwork('user-7', { name: 'Escritório', ipv4: '192.168.1.0', cidr: 24 });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toMatchObject({ userId: 'user-7', name: 'Escritório' });
  });
});