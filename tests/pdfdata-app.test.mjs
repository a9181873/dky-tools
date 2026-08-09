import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

function createElement(id = '') {
  const listeners = new Map();
  const classes = new Set();
  return {
    id,
    value: '',
    type: id === 'password-input' ? 'password' : '',
    files: [],
    textContent: '',
    innerHTML: '',
    disabled: false,
    classList: {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      contains: name => classes.has(name),
    },
    addEventListener: (type, listener) => listeners.set(type, listener),
    dispatch: (type, event = {}) => listeners.get(type)?.(event),
    setAttribute() {},
    focus() {},
    select() {},
    querySelectorAll: () => [],
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

test('正式站：顯示密碼提示後可用同一檔案成功重試', async () => {
  const ids = [
    'drop-zone', 'file-input', 'password-input', 'toggle-password',
    'btn-decrypt', 'btn-back', 'btn-new', 'btn-download-all', 'btn-retry',
    'btn-empty-retry', 'btn-clear-now', 'processing-text', 'file-list',
    'file-count', 'error-message', 'password-error', 'pw-file-name',
    'pw-file-size', 'expiry-countdown', 'step-upload', 'step-password',
    'step-processing', 'step-results', 'step-no-attachments', 'step-error',
  ];
  const elements = Object.fromEntries(ids.map(id => [id, createElement(id)]));
  const steps = ids
    .filter(id => id.startsWith('step-'))
    .map(id => elements[id]);
  elements['step-upload'].classList.add('active');

  let fileReadPromise;
  class FileReaderStub {
    readAsArrayBuffer(file) {
      fileReadPromise = Promise.resolve(this.onload({ target: { result: file.buffer } }));
    }
  }

  let attempts = 0;
  const pdfjsLib = {
    GlobalWorkerOptions: {},
    getDocument({ data, password }) {
      attempts += 1;
      structuredClone(data.buffer, { transfer: [data.buffer] });

      if (!password) {
        const error = new Error('No password given');
        error.name = 'PasswordException';
        return { promise: Promise.reject(error) };
      }

      assert.equal(password, 'correct-password');
      return {
        promise: Promise.resolve({
          numPages: 1,
          getAttachments: async () => ({
            proof: {
              filename: 'proof.txt',
              content: new Uint8Array([79, 75]),
            },
          }),
          getPage: async () => ({ getAnnotations: async () => [] }),
        }),
      };
    },
  };

  const document = {
    getElementById: id => elements[id] || null,
    querySelectorAll: selector => selector === '.step' ? steps : [],
    addEventListener() {},
    createElement: () => {
      const node = { textContent: '' };
      Object.defineProperty(node, 'innerHTML', {
        get: () => escapeHtml(node.textContent),
      });
      return node;
    },
    body: { appendChild() {}, removeChild() {} },
  };
  const window = { addEventListener() {} };

  const source = await readFile(new URL('../pdfdata/app.js', import.meta.url), 'utf8');
  vm.runInNewContext(source, {
    console,
    document,
    FileReader: FileReaderStub,
    pdfjsLib,
    setInterval: () => 1,
    clearInterval() {},
    setTimeout: callback => {
      queueMicrotask(callback);
      return 1;
    },
    URL,
    Uint8Array,
    ArrayBuffer,
    structuredClone,
    window,
  });

  const master = new Uint8Array([1, 2, 3, 4]).buffer;
  elements['file-input'].files = [{
    name: 'encrypted.pdf',
    size: master.byteLength,
    buffer: master,
  }];
  elements['file-input'].dispatch('change', {
    target: elements['file-input'],
  });
  await fileReadPromise;

  assert.ok(elements['step-password'].classList.contains('active'));
  assert.equal(master.byteLength, 4);

  elements['password-input'].value = 'correct-password';
  elements['btn-decrypt'].dispatch('click');
  for (let i = 0; i < 5 && !elements['step-results'].classList.contains('active'); i += 1) {
    await new Promise(resolve => setImmediate(resolve));
  }

  assert.equal(attempts, 2);
  assert.equal(master.byteLength, 4);
  assert.ok(elements['step-results'].classList.contains('active'));
  assert.equal(elements['file-count'].textContent, '1 個檔案');
  assert.equal(elements['error-message'].textContent, '');
});
