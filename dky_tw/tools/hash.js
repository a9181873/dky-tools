export const sha = async (algo, str) => {
  const enc = new TextEncoder();
  const buffer = await crypto.subtle.digest(algo, enc.encode(str));
  return Array.from(new Uint8Array(buffer)).map(w => w.toString(16).padStart(2, '0')).join('');
};
