import assert from 'node:assert/strict';
import test from 'node:test';

const MODULES = [
  ['root module', '../pdfextract.js'],
  ['tools module', '../tools/pdfextract.js'],
];

function createPdfJsWorkerStub() {
  return {
    getDocument({ data, password }) {
      assert.ok(data instanceof Uint8Array);

      // 模擬 PDF.js 將 buffer transfer 給 worker，傳入端會立即被 detach。
      structuredClone(data.buffer, { transfer: [data.buffer] });

      if (!password) {
        const error = new Error('No password given');
        error.name = 'PasswordException';
        return { promise: Promise.reject(error) };
      }

      return {
        promise: Promise.resolve({
          numPages: 1,
          getAttachments: async () => ({
            payload: {
              filename: 'payload.txt',
              content: new Uint8Array([79, 75]),
            },
          }),
          getPage: async () => ({ getAnnotations: async () => [] }),
        }),
      };
    },
  };
}

for (const [label, modulePath] of MODULES) {
  test(`${label}: 密碼重試不會重用已 detach 的 ArrayBuffer`, async () => {
    globalThis.window = { pdfjsLib: createPdfJsWorkerStub() };
    const moduleUrl = new URL(modulePath, import.meta.url);
    moduleUrl.searchParams.set('test', label);
    const { extractAttachments } = await import(moduleUrl);

    const master = new Uint8Array([1, 2, 3, 4]).buffer;
    await assert.rejects(
      extractAttachments(master),
      error => error.name === 'PasswordException',
    );
    assert.equal(master.byteLength, 4);

    const result = await extractAttachments(master, 'correct-password');
    assert.equal(master.byteLength, 4);
    assert.equal(result.numPages, 1);
    assert.deepEqual([...result.extracted['payload.txt']], [79, 75]);
  });
}
