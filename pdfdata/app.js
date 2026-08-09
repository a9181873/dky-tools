/* ============================================================
   PDF 附件提取工具 — Client-side Logic
   Uses PDF.js for decryption & attachment extraction
   Uses JSZip for bulk download packaging
   ============================================================ */

(function () {
    'use strict';

    // --- PDF.js Setup ---
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

    // --- Constants ---
    const EXPIRY_MS = 15 * 60 * 60 * 1000; // 15 hours

    // --- State ---
    let currentFile = null;
    let currentArrayBuffer = null;
    let extractedFiles = {};
    let countdownInterval = null;
    let expiryTime = null;

    // --- DOM Elements ---
    const $ = (sel) => document.getElementById(sel);
    const dropZone = $('drop-zone');
    const fileInput = $('file-input');
    const passwordInput = $('password-input');
    const togglePassword = $('toggle-password');
    const btnDecrypt = $('btn-decrypt');
    const btnBack = $('btn-back');
    const btnNew = $('btn-new');
    const btnDownloadAll = $('btn-download-all');
    const btnRetry = $('btn-retry');
    const btnEmptyRetry = $('btn-empty-retry');
    const btnClearNow = $('btn-clear-now');
    const processingText = $('processing-text');
    const fileList = $('file-list');
    const fileCount = $('file-count');
    const errorMessage = $('error-message');
    const passwordError = $('password-error');

    // --- Step Management ---
    function showStep(stepId) {
        document.querySelectorAll('.step').forEach((s) => s.classList.remove('active'));
        const target = $(stepId);
        if (target) {
            target.classList.add('active');
        }
    }

    function resetState() {
        currentFile = null;
        currentArrayBuffer = null;
        extractedFiles = {};
        passwordInput.value = '';
        passwordError.textContent = '';
        fileInput.value = '';
        stopCountdown();
        showStep('step-upload');
    }

    // --- 15-Hour Auto-Delete Countdown ---
    function startCountdown() {
        stopCountdown();
        expiryTime = Date.now() + EXPIRY_MS;
        updateCountdownDisplay();
        countdownInterval = setInterval(updateCountdownDisplay, 1000);
    }

    function stopCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        expiryTime = null;
    }

    function updateCountdownDisplay() {
        if (!expiryTime) return;
        const remaining = expiryTime - Date.now();
        if (remaining <= 0) {
            clearAllData();
            return;
        }
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        const display =
            String(h).padStart(2, '0') + ':' +
            String(m).padStart(2, '0') + ':' +
            String(s).padStart(2, '0');
        const el = $('expiry-countdown');
        if (el) el.textContent = display;
    }

    function clearAllData() {
        stopCountdown();
        extractedFiles = {};
        currentFile = null;
        currentArrayBuffer = null;
        passwordInput.value = '';
        passwordError.textContent = '';
        fileInput.value = '';
        showStep('step-upload');
    }

    // --- File Handling ---
    function handleFile(file) {
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            showError('請選擇 PDF 檔案');
            return;
        }
        if (file.size > 200 * 1024 * 1024) {
            showError('檔案過大（上限 200 MB）');
            return;
        }

        currentFile = file;
        const reader = new FileReader();
        reader.onload = async (e) => {
            currentArrayBuffer = e.target.result;
            await tryOpenPDF();
        };
        reader.onerror = () => showError('讀取檔案失敗');
        reader.readAsArrayBuffer(file);
    }

    // --- PDF Processing ---
    async function tryOpenPDF(password) {
        showStep('step-processing');
        processingText.textContent = password ? '正在解密 PDF⋯' : '正在讀取 PDF⋯';

        try {
            // PDF.js transfers this buffer to its worker and detaches it. Always
            // pass a copy so the cached source remains available for password retries.
            const config = { data: new Uint8Array(currentArrayBuffer.slice(0)) };
            if (password) config.password = password;

            const loadingTask = pdfjsLib.getDocument(config);
            const pdf = await loadingTask.promise;

            processingText.textContent = '正在提取附件⋯';
            await extractAttachments(pdf);
        } catch (err) {
            handlePDFError(err, password);
        }
    }

    function handlePDFError(err, usedPassword) {
        if (err.name === 'PasswordException') {
            if (!usedPassword) {
                // First attempt — show password prompt
                setPasswordFileInfo();
                showStep('step-password');
                setTimeout(() => passwordInput.focus(), 100);
            } else {
                // Wrong password
                passwordError.textContent = '密碼錯誤，請重新輸入';
                showStep('step-password');
                passwordInput.select();
            }
        } else {
            showError('讀取 PDF 失敗：' + (err.message || '未知錯誤'));
        }
    }

    async function extractAttachments(pdf) {
        extractedFiles = {};

        // Method 1: Catalog-level embedded files
        try {
            const attachments = await pdf.getAttachments();
            if (attachments) {
                for (const [name, att] of Object.entries(attachments)) {
                    if (att.content && att.content.length > 0) {
                        const displayName = att.filename || name;
                        extractedFiles[displayName] = att.content;
                    }
                }
            }
        } catch (_) {
            // getAttachments not supported or failed, continue
        }

        // Method 2: Page-level FileAttachment annotations
        try {
            const numPages = pdf.numPages;
            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const annotations = await page.getAnnotations();
                for (const annot of annotations) {
                    if (annot.subtype === 'FileAttachment' && annot.file) {
                        const fname = annot.file.filename || 'attachment_page' + i;
                        if (annot.file.content && annot.file.content.length > 0) {
                            extractedFiles[fname] = annot.file.content;
                        }
                    }
                }
            }
        } catch (_) {
            // Annotation extraction failed, continue
        }

        if (Object.keys(extractedFiles).length === 0) {
            showStep('step-no-attachments');
        } else {
            renderResults();
            showStep('step-results');
        }
    }

    // --- Render Results ---
    function renderResults() {
        const entries = Object.entries(extractedFiles);
        fileCount.textContent = entries.length + ' 個檔案';

        // Start 15-hour countdown
        startCountdown();

        fileList.innerHTML = entries
            .map(([name, data], i) => {
                const size = formatSize(data.length || data.byteLength || 0);
                const icon = getFileIcon(name);
                const safeName = escapeHtml(name);
                return (
                    '<li class="file-item" style="animation-delay:' + (i * 0.04) + 's">' +
                        '<div class="file-item__icon">' + icon + '</div>' +
                        '<div class="file-item__info">' +
                            '<span class="file-item__name" title="' + safeName + '">' + safeName + '</span>' +
                            '<span class="file-item__size">' + size + '</span>' +
                        '</div>' +
                        '<button class="file-item__download" data-filename="' + safeName + '" title="下載 ' + safeName + '">' +
                            '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
                                '<path d="M8 2V10M4 7L8 11L12 7"/>' +
                                '<path d="M2 12V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V12"/>' +
                            '</svg>' +
                        '</button>' +
                    '</li>'
                );
            })
            .join('');

        // Bind download buttons
        fileList.querySelectorAll('.file-item__download').forEach((btn) => {
            btn.addEventListener('click', () => {
                downloadFile(btn.dataset.filename);
            });
        });
    }

    // --- Downloads ---
    function downloadFile(filename) {
        const data = extractedFiles[filename];
        if (!data) return;
        const blob = new Blob([data]);
        triggerDownload(blob, filename);
    }

    async function downloadAll() {
        if (typeof JSZip === 'undefined') {
            showError('JSZip 尚未載入，請重新整理頁面');
            return;
        }
        btnDownloadAll.disabled = true;
        btnDownloadAll.textContent = '打包中⋯';

        try {
            const zip = new JSZip();
            for (const [name, data] of Object.entries(extractedFiles)) {
                zip.file(name, data);
            }
            const blob = await zip.generateAsync({ type: 'blob' });
            const pdfBaseName = currentFile
                ? currentFile.name.replace(/\.pdf$/i, '')
                : 'extracted';
            triggerDownload(blob, pdfBaseName + '_attachments.zip');
        } catch (e) {
            showError('打包失敗：' + e.message);
        } finally {
            btnDownloadAll.disabled = false;
            btnDownloadAll.innerHTML =
                '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 2V10M4 7L8 11L12 7"/><path d="M2 12V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V12"/></svg>' +
                '全部打包下載';
        }
    }

    function triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    // --- Error Display ---
    function showError(msg) {
        errorMessage.textContent = msg;
        showStep('step-error');
    }

    // --- File Info for Password Step ---
    function setPasswordFileInfo() {
        if (!currentFile) return;
        $('pw-file-name').textContent = currentFile.name;
        $('pw-file-size').textContent = formatSize(currentFile.size);
    }

    // --- Utilities ---
    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }

    function getFileIcon(filename) {
        const ext = (filename.split('.').pop() || '').toLowerCase();
        const map = {
            zip: '📦', '7z': '📦', rar: '📦', tar: '📦', gz: '📦',
            xlsx: '📊', xls: '📊', csv: '📊', ods: '📊',
            pdf: '📄',
            doc: '📝', docx: '📝', txt: '📝', rtf: '📝',
            ppt: '📽️', pptx: '📽️',
            jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️', webp: '🖼️',
            mp3: '🎵', wav: '🎵', flac: '🎵',
            mp4: '🎬', avi: '🎬', mov: '🎬', mkv: '🎬',
            json: '⚙️', xml: '⚙️', html: '🌐',
        };
        return map[ext] || '📎';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- Event Listeners ---

    // Drop zone click → open file dialog
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drop-zone--dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drop-zone--dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drop-zone--dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Prevent default browser drop behavior
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());

    // Password toggle
    togglePassword.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        togglePassword.setAttribute('aria-label', isPassword ? '隱藏密碼' : '顯示密碼');
    });

    // Decrypt button
    btnDecrypt.addEventListener('click', () => {
        const pw = passwordInput.value;
        if (!pw) {
            passwordError.textContent = '請輸入密碼';
            passwordInput.focus();
            return;
        }
        passwordError.textContent = '';
        tryOpenPDF(pw);
    });

    // Enter key in password field
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnDecrypt.click();
        }
    });

    // Back button
    btnBack.addEventListener('click', resetState);

    // New file button
    btnNew.addEventListener('click', resetState);

    // Download all
    btnDownloadAll.addEventListener('click', downloadAll);

    // Retry / empty retry
    btnRetry.addEventListener('click', resetState);
    btnEmptyRetry.addEventListener('click', resetState);

    // Clear data now
    btnClearNow.addEventListener('click', clearAllData);

    // Clear data on tab close / navigate away
    window.addEventListener('beforeunload', () => {
        extractedFiles = {};
        currentArrayBuffer = null;
    });
})();
