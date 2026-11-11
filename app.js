const fileInput = document.getElementById('fileInput');
const sourceText = document.getElementById('sourceText');
const outputText = document.getElementById('outputText');

const fileNameEl = document.getElementById('fileName');
const mimeTypeEl = document.getElementById('mimeType');
const fileSizeEl = document.getElementById('fileSize');
const fileExtEl = document.getElementById('fileExt');
const charCountEl = document.getElementById('charCount');
const wordCountEl = document.getElementById('wordCount');
const lineCountEl = document.getElementById('lineCount');
const resetBtn = document.getElementById('resetBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const statusPill = document.getElementById('statusPill');

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function getFileExt(name) {
  if (!name) return '—';
  const parts = name.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '—';
}

function updateStats(rawText) {
  const text = rawText ?? '';
  const characters = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split(/\r?\n/).length : 0;

  charCountEl.textContent = String(characters);
  wordCountEl.textContent = String(words);
  lineCountEl.textContent = String(lines);
}

function setStatus(text) {
  statusPill.textContent = text;
}

function mirrorText(value) {
  return value
    .split('\n')
    .map((line) => [...line].reverse().join(''))
    .reverse()
    .join('\n');
}

function reverseWords(value) {
  return value
    .split(/\s+/)
    .map((word) => [...word].reverse().join(''))
    .join(' ');
}

function titleCase(value) {
  return value
    .toLowerCase()
    .replace(/(^|\s)([a-zа-яё])/g, (_, prefix, char) => prefix + char.toUpperCase());
}

function trimWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function sortLines(value) {
  return value
    .split(/\r?\n/)
    .sort((a, b) => a.localeCompare(b))
    .join('\n');
}

function uniqueLines(value) {
  const items = value.split(/\r?\n/);
  const seen = new Set();
  const result = [];

  for (const item of items) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }

  return result.join('\n');
}

function applyTransformation(type) {
  const current = sourceText.value;

  let result = current;

  switch (type) {
    case 'mirror':
      result = mirrorText(current);
      break;
    case 'reverseWords':
      result = reverseWords(current);
      break;
    case 'upper':
      result = current.toUpperCase();
      break;
    case 'lower':
      result = current.toLowerCase();
      break;
    case 'title':
      result = titleCase(current);
      break;
    case 'trim':
      result = trimWhitespace(current);
      break;
    case 'sort':
      result = sortLines(current);
      break;
    case 'unique':
      result = uniqueLines(current);
      break;
    default:
      break;
  }

  outputText.value = result;
  updateStats(result);
  setStatus('Обработано');
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
}

async function handleFileSelect(event) {
  const [file] = event.target.files;
  if (!file) return;

  try {
    const content = await readFileAsText(file);
    sourceText.value = content;
    outputText.value = content;
    updateStats(content);

    fileNameEl.textContent = file.name;
    mimeTypeEl.textContent = file.type || 'text/plain';
    fileSizeEl.textContent = formatBytes(file.size);
    fileExtEl.textContent = getFileExt(file.name);
    setStatus('Файл загружен');
  } catch (error) {
    console.error(error);
    setStatus('Ошибка');
  }
}

function resetAll() {
  fileInput.value = '';
  sourceText.value = '';
  outputText.value = '';
  fileNameEl.textContent = '—';
  mimeTypeEl.textContent = '—';
  fileSizeEl.textContent = '—';
  fileExtEl.textContent = '—';
  updateStats('');
  setStatus('Готово');
}

async function copyOutput() {
  const text = outputText.value || sourceText.value;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    setStatus('Скопировано');
  } catch (error) {
    console.error(error);
    setStatus('Не удалось скопировать');
  }
}

function downloadOutput() {
  const text = outputText.value || sourceText.value;
  if (!text) return;

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const baseName = fileNameEl.textContent !== '—' ? fileNameEl.textContent.replace(/\.[^.]+$/, '') : 'mirror-output';
  link.href = url;
  link.download = `${baseName}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus('Скачано');
}

fileInput.addEventListener('change', handleFileSelect);
sourceText.addEventListener('input', () => {
  updateStats(sourceText.value);
  outputText.value = sourceText.value;
  setStatus('Редактирование');
});

document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => applyTransformation(button.dataset.action));
});

copyBtn.addEventListener('click', copyOutput);
resetBtn.addEventListener('click', resetAll);
downloadBtn.addEventListener('click', downloadOutput);

updateStats('');
resetAll();
