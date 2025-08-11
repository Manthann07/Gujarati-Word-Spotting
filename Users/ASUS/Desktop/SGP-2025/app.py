from flask import Flask, render_template, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os
import shutil
from typing import List, Dict, Any
import json
import io
import base64

# Import our custom modules
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'server'))

from models.model_utils import IndicBERTModel
from models.ocr_utils import OCRProcessor
from pdf.pdf_utils import PDFProcessor

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Ensure uploads directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize models
model_utils = IndicBERTModel()
ocr_processor = OCRProcessor()
pdf_processor = PDFProcessor()

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/upload-pdf', methods=['POST'])
def upload_pdf():
    """Upload a PDF file for processing"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only PDF files are allowed'}), 400
        
        # Secure the filename
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save uploaded file
        file.save(file_path)
        
        # Process the PDF
        result = pdf_processor.process_pdf_sync(file_path)
        
        if 'error' in result:
            return jsonify(result), 500
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': f'Error processing PDF: {str(e)}'}), 500

@app.route('/search', methods=['POST'])
def search_pdf():
    """Search for text in a specific PDF"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        pdf_filename = data.get('pdf_filename', '')
        
        if not query or not pdf_filename:
            return jsonify({'error': 'Query and PDF filename are required'}), 400
        
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], pdf_filename)
        
        if not os.path.exists(pdf_path):
            return jsonify({'error': 'PDF file not found'}), 404
        
        # Perform search using the model
        results = model_utils.search_text_sync(pdf_path, query)
        return jsonify(results)
    
    except Exception as e:
        return jsonify({'error': f'Error searching PDF: {str(e)}'}), 500

@app.route('/pdfs', methods=['GET'])
def list_pdfs():
    """List all uploaded PDFs"""
    try:
        pdf_files = []
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            if filename.endswith('.pdf'):
                pdf_files.append(filename)
        return jsonify({'pdfs': pdf_files})
    except Exception as e:
        return jsonify({'error': f'Error listing PDFs: {str(e)}'}), 500

@app.route('/api-status', methods=['GET'])
def api_status():
    """Check API status"""
    return jsonify({'message': 'PDF Search API is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 