export function isPrismaCuid(id: string) {
  return /^cln[0-9a-z]{22}$/.test(id);
}
