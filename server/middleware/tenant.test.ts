import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { requireTenantContext } from "./tenant";
import { storage } from "../storage";

vi.mock("../storage", () => ({
  storage: {
    getTenant: vi.fn(),
  },
}));

const mockedStorage = vi.mocked(storage);

function createResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("requireTenantContext middleware", () => {
  let next: NextFunction;
  let res: Response;

  beforeEach(() => {
    next = vi.fn();
    res = createResponse();
    mockedStorage.getTenant.mockReset();
  });

  it("attaches tenant for valid tenant user tokens", async () => {
    const req = {
      user: { type: "tenant_user", tenantId: "tenant-123" },
    } as Request;
    const tenant = { id: "tenant-123", slug: "tenant-123" } as any;
    mockedStorage.getTenant.mockResolvedValue(tenant);

    await requireTenantContext(req, res, next);

    expect(mockedStorage.getTenant).toHaveBeenCalledWith("tenant-123");
    expect(req.tenant).toEqual(tenant);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("blocks platform admin tokens", async () => {
    const req = {
      user: { type: "platform_admin" },
    } as Request;

    await requireTenantContext(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Tenant context required" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 404 when tenant is missing", async () => {
    const req = {
      user: { type: "tenant_user", tenantId: "missing-tenant" },
    } as Request;
    mockedStorage.getTenant.mockResolvedValue(undefined);

    await requireTenantContext(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Tenant not found" })
    );
    expect(next).not.toHaveBeenCalled();
  });
});

