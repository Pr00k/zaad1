/** Largest-remainder allocation in hundredths; totals are exact. */
export function allocateAmount(amount: number, vaults: { id: string; pct: number }[]) {
  const total = vaults.reduce((sum, v) => sum + Math.max(0, v.pct), 0);
  if (!Number.isFinite(amount) || amount <= 0 || total <= 0) return [];
  const cents = Math.round(amount * 100);
  const rows = vaults.map((v) => {
    const raw = cents * Math.max(0, v.pct) / total;
    return { vaultId: v.id, cents: Math.floor(raw), remainder: raw - Math.floor(raw) };
  });
  let remaining = cents - rows.reduce((sum, row) => sum + row.cents, 0);
  for (const row of [...rows].sort((a, b) => b.remainder - a.remainder)) {
    if (remaining <= 0) break;
    row.cents += 1;
    remaining -= 1;
  }
  return rows.map((row) => ({ vaultId: row.vaultId, amount: row.cents / 100 }));
}