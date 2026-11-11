const fileInput = document.getElementById('fileInput');
const sourceText = document.getElementById('sourceText');
const outputText = document.getElementById('outputText');
const fileName = document.getElementById('fileName');
const mimeType = document.getElementById('mimeType');
const fileSize = document.getElementById('fileSize');
const fileExt = document.getElementById('fileExt');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');

const resetButton = document.getElementById('resetButton');
const mirrorBtn = document.getElementById('mirrorBtn');
const upperBtn = document.getElementById('upperBtn');
const lowerBtn = document.getElementById('lowerBtn');
const trimBtn = document.getElementById('trimBtn');
const downloadBtn = document.getElementById('downloadBtn');

function updateStats(value) {
  const text = value ?? '';
  charCount.textContent = String(text.length);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  wordCount.textContent = String(words);
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsText(file);
  });
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function getFileExtension(name) {
  if (!name) return '—';
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop().toUpperCase() : '—';
}

function mirrorText(value) {
  return value
    .split('\n')
    .map((line) => [...line].reverse().join(''))
    .reverse()
    .join('\n');
}

async function handleFileInput(event) {
  const [file] = event.target.files;
  if (!file) return;

  const text = await readFileAsText(file);
  sourceText.value = text;
  outputText.value = text;
  updateStats(text);

  fileName.textContent = file.name;
  mimeType.textContent = file.type || 'text/plain';
  fileSize.textContent = formatBytes(file.size);
  fileExt.textContent = getFileExtension(file.name);
}

function applyTransform(fn) {
  const value = sourceText.value;
  const result = fn(value);
  outputText.value = result;
  updateStats(result);
}

mirrorBtn.addEventListener('click', () => {
  applyTransform(mirrorText);
});

upperBtn.addEventListener('click', () => {
  applyTransform((value) => value.toUpperCase());
});

lowerBtn.addEventListener('click', () => {
  applyTransform((value) => value.toLowerCase());
});

trimBtn.addEventListener('click', () => {
  applyTransform((value) => value.replace(/\s+/g, ' ').trim());
});

resetButton.addEventListener('click', () => {
  fileInput.value = '';
  sourceText.value = '';
  outputText.value = '';
  fileName.textContent = '—';
  mimeType.textContent = '—';
  fileSize.textContent = '—';
  fileExt.textContent = '—';
  updateStats('');
});

downloadBtn.addEventListener('click', () => {
  const result = outputText.value || sourceText.value;
  if (!result) return;

  const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = (fileName.textContent === '—' ? 'mirror-output' : fileName.textContent.replace(/\.[^.]+$/, '')) + '.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

sourceText.addEventListener('input', () => {
  updateStats(sourceText.value);
  outputText.value = sourceText.value;
});

fileInput.addEventListener('change', handleFileInput);
updateStats('');

