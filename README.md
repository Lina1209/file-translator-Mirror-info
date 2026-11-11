# File Translator / Mirror Info

Small static web app for working with text files: upload a file, view its metadata, mirror the text, and download the result.

## Features
- upload `.txt`, `.md`, `.json`, `.csv` and other text-based files
- display file name, size, type, extension, and text stats
- quick text actions: mirror, uppercase, lowercase, remove extra spaces
- download processed content in `.txt` format

## Run locally
Open `index.html` in a browser, or serve the folder with any static file server:

```bash
python -m http.server 8000
```

Then open http://localhost:8000

## Files
- `index.html` — application layout
- `styles.css` — styling
- `app.js` — logic for file handling and text operations
