# PDF Search App - Flask Version

A modern web application for uploading, processing, and searching PDF documents with AI-powered semantic search. This version is built with Flask and supports multiple Indian languages including Gujarati, Hindi, English, and others.

## Features

- **Multi-language Support**: Supports English, Gujarati, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Odia, and Punjabi
- **OCR Processing**: Automatically detects and processes scanned PDFs using OCR
- **AI-Powered Search**: Uses IndicBERT for semantic search across PDF content
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **Drag & Drop**: Easy file upload with drag and drop functionality
- **Real-time Processing**: Live progress indicators and notifications

## Installation

### Prerequisites

1. **Python 3.8+** installed on your system
2. **Tesseract OCR** installed for OCR functionality

#### Installing Tesseract OCR

**Windows:**
1. Download Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install with language data for Indian languages
3. Add Tesseract to your system PATH

**macOS:**
```bash
brew install tesseract
brew install tesseract-lang  # For additional languages
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install tesseract-ocr
sudo apt-get install tesseract-ocr-guj  # For Gujarati
sudo apt-get install tesseract-ocr-hin  # For Hindi
```

### Quick Start

1. **Clone or download the project files**

2. **Run the application:**
   ```bash
   python run_flask.py
   ```

3. **Open your browser and go to:**
   ```
   http://localhost:5000
   ```

### Manual Installation

If you prefer to install dependencies manually:

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements_flask.txt
   ```

2. **Run the Flask application:**
   ```bash
   python app.py
   ```

## Usage

### Uploading PDFs

1. **Drag and drop** a PDF file onto the upload area, or click "Browse Files"
2. The app will automatically detect if the PDF is scanned or text-based
3. For scanned PDFs, OCR will be used to extract text
4. For text-based PDFs, text will be extracted directly

### Searching

1. After uploading a PDF, the search section will appear
2. Enter your search query in any supported language
3. Click "Search" or press Enter
4. Results will be displayed with relevance scores and highlighted text

### Supported File Types

- **PDF files** (up to 50MB)
- Both scanned and text-based PDFs
- Multi-language content

## Technical Details

### Architecture

- **Backend**: Flask (Python)
- **Frontend**: HTML, JavaScript, Tailwind CSS
- **AI Model**: IndicBERT for semantic search
- **OCR**: Tesseract with multi-language support
- **PDF Processing**: PyMuPDF and PyPDF2

### Key Components

- `app.py`: Main Flask application
- `templates/index.html`: Frontend interface
- `server/models/`: AI and OCR processing modules
- `server/pdf/`: PDF processing utilities

### Language Support

The application supports the following languages for OCR and search:

- **English** (eng)
- **Gujarati** (guj)
- **Hindi** (hin)
- **Tamil** (tam)
- **Telugu** (tel)
- **Kannada** (kan)
- **Malayalam** (mal)
- **Bengali** (ben)
- **Marathi** (mar)
- **Odia** (ori)
- **Punjabi** (pan)

## Troubleshooting

### Common Issues

1. **OCR not working:**
   - Ensure Tesseract is installed and in your PATH
   - Check that language data is installed for your target languages

2. **Model loading errors:**
   - The app will fall back to basic search if the AI model fails to load
   - Check your internet connection for model downloads

3. **File upload issues:**
   - Ensure the file is a valid PDF
   - Check file size (max 50MB)
   - Verify file permissions

### Performance Tips

- For large PDFs, processing may take some time
- OCR processing is slower than direct text extraction
- The first search may be slower due to model initialization

## Development

### Project Structure

```
SGP-2025/
├── app.py                 # Main Flask application
├── templates/
│   └── index.html        # Frontend template
├── server/
│   ├── models/           # AI and OCR modules
│   └── pdf/              # PDF processing utilities
├── uploads/              # Uploaded PDF storage
├── requirements_flask.txt # Python dependencies
└── run_flask.py          # Quick start script
```

### Adding New Features

1. **New Language Support:**
   - Install Tesseract language data
   - Update `supported_languages` in `ocr_utils.py`

2. **Custom Search Algorithms:**
   - Modify `model_utils.py` for different search methods
   - Update the search endpoint in `app.py`

## License

This project is for educational and research purposes.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Verify all prerequisites are installed
3. Check the console for error messages 