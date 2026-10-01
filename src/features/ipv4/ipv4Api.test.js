import { afterEach, describe, expect, it, vi } from "vitest";
import {
  deleteSubnetwork,
  getUserSubnetworks,
  saveSubnetwork,
  updateSubnetwork,
} from "./ipv4Api";

afterEach(() => vi.unstubAllGlobals());

describe("IPv4 API", () => {
  it("loads only subnetworks associated with the requested user", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal("fetch", fetchMock);

    await getUserSubnetworks("user-7");

    expect(fetchMock.mock.calls[0][0]).toContain("/subnetworks?userId=user-7");
  });

  it("persists a subnetwork with its owning user id", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ id: "sub-1" }) });
    vi.stubGlobal("fetch", fetchMock);

    await saveSubnetwork("user-7", {
      name: "Escritório",
      ipv4: "192.168.1.0",
      cidr: 24,
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toMatchObject({
      userId: "user-7",
      name: "Escritório",
    });
  });

  it("updates a saved subnetwork with PATCH", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ id: 7 }) });
    vi.stubGlobal("fetch", fetchMock);

    await updateSubnetwork(7, {
      name: "Escritório atualizado",
      allocations: [],
    });

    expect(fetchMock.mock.calls[0][0]).toContain("/subnetworks/7");
    expect(fetchMock.mock.calls[0][1].method).toBe("PATCH");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      name: "Escritório atualizado",
    });
  });

  it("deletes a saved subnetwork with DELETE", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal("fetch", fetchMock);

    await deleteSubnetwork(7);

    expect(fetchMock.mock.calls[0][0]).toContain("/subnetworks/7");
    expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
  });
});
