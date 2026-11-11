document.addEventListener('DOMContentLoaded', () => {
    const modeTabs = document.querySelectorAll('#modeTabs .mk-tab');
    const panelFile = document.getElementById('panelFile');
    const panelText = document.getElementById('panelText');
    const panelPhoto = document.getElementById('panelPhoto');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileChip = document.getElementById('fileChip');
    const fileChipName = document.getElementById('fileChipName');
    const fileChipMeta = document.getElementById('fileChipMeta');
    const fileRemove = document.getElementById('fileRemove');
    const textInput = document.getElementById('textInput');
    const pickGalleryBtn = document.getElementById('pickGalleryBtn');
    const galleryInput = document.getElementById('galleryInput');
    const photoPreview = document.getElementById('photoPreview');
    const srcLang = document.getElementById('srcLang');
    const tgtLang = document.getElementById('tgtLang');
    const swapLangs = document.getElementById('swapLangs');
    const translateBtn = document.getElementById('translateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const progressWrap = document.getElementById('progressWrap');
    const progressLabel = document.getElementById('progressLabel');
    const progressPercent = document.getElementById('progressPercent');
    const progressBar = document.getElementById('progressBar');
    const stages = document.querySelectorAll('#stageList .mk-stage');
    const errorWrap = document.getElementById('errorWrap');
    const errorText = document.getElementById('errorText');
    const resultWrap = document.getElementById('resultWrap');
    const resultMeta = document.getElementById('resultMeta');
    const resultPane = document.getElementById('resultPane');
    const resultText = document.getElementById('resultText');
    const viewBtn = document.getElementById('viewBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    if (!translateBtn) return;
    let currentMode = 'file';
    let selectedFile = null;
    let selectedPhoto = null;
    let outputBlob = null;
    let outputFileName = 'translated.txt';
    let outputPlainText = '';

    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            modeTabs.forEach(t => t.classList.remove('is-active'));
            tab.classList.add('is-active');
            currentMode = tab.dataset.mode;
            panelFile.classList.toggle('hidden', currentMode !== 'file');
            panelText.classList.toggle('hidden', currentMode !== 'text');
            panelPhoto.classList.toggle('hidden', currentMode !== 'photo');
        });
    });

    if (dropZone) dropZone.addEventListener('click', () => fileInput.click());
    if (fileInput) fileInput.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) {
            selectedFile = e.target.files[0];
            fileChipName.textContent = selectedFile.name;
            fileChipMeta.textContent = `${(selectedFile.size / 1024).toFixed(1)} КБ`;
            fileChip.classList.remove('is-hidden', 'hidden');
        }
    });
    if (fileRemove) fileRemove.addEventListener('click', () => { selectedFile = null; fileChip.classList.add('is-hidden'); });
    if (pickGalleryBtn) pickGalleryBtn.addEventListener('click', () => galleryInput.click());
    if (galleryInput) galleryInput.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) {
            selectedPhoto = e.target.files[0];
            photoPreview.innerHTML = `<p class="font-semibold">${selectedPhoto.name}</p>`;
        }
    });
    if (swapLangs) swapLangs.addEventListener('click', () => {
        if (srcLang.value !== 'auto') {
            const tmp = srcLang.value; srcLang.value = tgtLang.value; tgtLang.value = tmp;
        }
    });
    if (clearBtn) clearBtn.addEventListener('click', () => {
        selectedFile = null; selectedPhoto = null; textInput.value = '';
        fileChip.classList.add('is-hidden'); errorWrap.classList.add('hidden'); resultWrap.classList.add('hidden');
    });

    function setProgress(pct, lbl, stIdx) {
        progressWrap.classList.remove('hidden');
        progressBar.style.width = `${pct}%`;
        progressPercent.textContent = `${pct}%`;
        progressLabel.textContent = lbl;
        stages.forEach((s, i) => { s.classList.toggle('is-done', i < stIdx); s.classList.toggle('is-active', i === stIdx); });
    }

    translateBtn.addEventListener('click', async () => {
        errorWrap.classList.add('hidden');
        resultWrap.classList.add('hidden');
        try {
            setProgress(20, 'Чтение данных…', 0);
            let raw = '';
            if (currentMode === 'text') raw = textInput.value.trim();
            else if (currentMode === 'file' && selectedFile) raw = await selectedFile.text();
            if (!raw) throw new Error('Введите текст или выберите текстовый файл для перевода.');

            setProgress(60, 'Выполняется перевод…', 2);
            const translated = window.AppAPI ? await window.AppAPI.translate(raw, srcLang.value, tgtLang.value) : raw;
            setProgress(100, 'Готово!', 4);
            outputPlainText = translated;
            outputFileName = `translated_${tgtLang.value}.txt`;
            outputBlob = new Blob([translated], { type: 'text/plain;charset=utf-8' });
            resultText.textContent = translated;
            resultMeta.textContent = `${outputFileName} · ${translated.length} симв.`;
            resultWrap.classList.remove('hidden');
        } catch (err) {
            progressWrap.classList.add('hidden');
            errorText.textContent = err.message;
            errorWrap.classList.remove('hidden');
        }
    });

    if (viewBtn) viewBtn.addEventListener('click', () => resultPane.classList.toggle('hidden'));
    if (copyBtn) copyBtn.addEventListener('click', () => navigator.clipboard.writeText(outputPlainText));
    if (downloadBtn) downloadBtn.addEventListener('click', () => {
        if (!outputBlob) return;
        const a = document.createElement('a'); a.href = URL.createObjectURL(outputBlob); a.download = outputFileName; a.click();
    });
});