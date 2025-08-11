import PyPDF2
import fitz  # PyMuPDF
import os
from typing import List, Dict, Any
import json
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from models.ocr_utils import OCRProcessor

class PDFProcessor:
    def __init__(self):
        """Initialize PDF processor"""
        self.ocr_processor = OCRProcessor()
    
    async def process_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Process a PDF file and extract text (async version)"""
        return self.process_pdf_sync(pdf_path)
    
    def process_pdf_sync(self, pdf_path: str) -> Dict[str, Any]:
        """Process a PDF file and extract text (synchronous version)"""
        try:
            # Check if file exists
            if not os.path.exists(pdf_path):
                return {"error": "PDF file not found"}
            
            # Auto-detect language first
            detected_languages = self.ocr_processor.auto_detect_language(pdf_path)
            print(f"Detected languages: {detected_languages}")
            
            # Check if it's a scanned PDF
            is_scanned = self.ocr_processor.is_scanned_pdf(pdf_path)
            
            if is_scanned:
                # Use OCR for scanned PDFs with detected languages
                text_pages = self.ocr_processor.process_scanned_pdf(pdf_path, detected_languages)
                processing_method = f"OCR ({'+'.join(detected_languages)})"
            else:
                # Extract text directly for text-based PDFs
                text_pages = self.extract_text_from_pdf(pdf_path)
                processing_method = "Direct Text Extraction"
                
                # If direct extraction didn't work well, try OCR as fallback
                if not text_pages or all(len(page['text']) < 50 for page in text_pages):
                    print("Direct extraction failed, trying OCR as fallback...")
                    text_pages = self.ocr_processor.process_scanned_pdf(pdf_path, detected_languages)
                    processing_method = f"OCR Fallback ({'+'.join(detected_languages)})"
            
            # Get basic PDF info
            pdf_info = self.get_pdf_info(pdf_path)
            
            return {
                "success": True,
                "filename": os.path.basename(pdf_path),
                "total_pages": len(text_pages),
                "processing_method": processing_method,
                "detected_languages": detected_languages,
                "pdf_info": pdf_info,
                "pages": text_pages
            }
        
        except Exception as e:
            return {"error": f"Error processing PDF: {str(e)}"}
    
    def extract_text_from_pdf(self, pdf_path: str) -> List[Dict[str, Any]]:
        """Extract text from PDF using PyPDF2"""
        text_pages = []
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                for page_num, page in enumerate(pdf_reader.pages):
                    text = page.extract_text()
                    if text.strip():  # Only add non-empty pages
                        text_pages.append({
                            'page': page_num + 1,
                            'text': text.strip(),
                            'confidence': 1.0  # High confidence for direct text extraction
                        })
        
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
        
        return text_pages
    
    def get_pdf_info(self, pdf_path: str) -> Dict[str, Any]:
        """Get basic information about the PDF"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                info = {
                    'num_pages': len(pdf_reader.pages),
                    'file_size': os.path.getsize(pdf_path),
                    'title': '',
                    'author': '',
                    'subject': '',
                    'creator': ''
                }
                
                # Get metadata if available
                if pdf_reader.metadata:
                    metadata = pdf_reader.metadata
                    info['title'] = metadata.get('/Title', '')
                    info['author'] = metadata.get('/Author', '')
                    info['subject'] = metadata.get('/Subject', '')
                    info['creator'] = metadata.get('/Creator', '')
                
                return info
        
        except Exception as e:
            print(f"Error getting PDF info: {e}")
            return {'num_pages': 0, 'file_size': 0}
    
    def highlight_text_in_pdf(self, pdf_path: str, search_terms: List[str], output_path: str = None) -> str:
        """Highlight search terms in PDF (creates a new PDF with highlights)"""
        try:
            doc = fitz.open(pdf_path)
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                # Search for terms on this page
                for term in search_terms:
                    text_instances = page.search_for(term)
                    
                    # Highlight each instance
                    for inst in text_instances:
                        highlight = page.add_highlight_annot(inst)
                        highlight.set_colors(stroke=(1, 1, 0))  # Yellow highlight
                        highlight.update()
            
            # Save highlighted PDF
            if output_path is None:
                base_name = os.path.splitext(pdf_path)[0]
                output_path = f"{base_name}_highlighted.pdf"
            
            doc.save(output_path)
            doc.close()
            
            return output_path
        
        except Exception as e:
            print(f"Error highlighting PDF: {e}")
            return None
    
    def get_page_as_image(self, pdf_path: str, page_num: int, zoom: float = 2.0) -> bytes:
        """Get a specific page as image bytes"""
        try:
            doc = fitz.open(pdf_path)
            
            if page_num < 0 or page_num >= len(doc):
                return None
            
            page = doc.load_page(page_num)
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            
            doc.close()
            return img_data
        
        except Exception as e:
            print(f"Error getting page as image: {e}")
            return None
    
    def extract_text_by_coordinates(self, pdf_path: str, page_num: int, rect: tuple) -> str:
        """Extract text from specific coordinates on a page"""
        try:
            doc = fitz.open(pdf_path)
            
            if page_num < 0 or page_num >= len(doc):
                return ""
            
            page = doc.load_page(page_num)
            text = page.get_text("text", clip=rect)
            
            doc.close()
            return text.strip()
        
        except Exception as e:
            print(f"Error extracting text by coordinates: {e}")
            return ""
    
    def get_text_blocks(self, pdf_path: str, page_num: int) -> List[Dict[str, Any]]:
        """Get text blocks with their positions on a page"""
        try:
            doc = fitz.open(pdf_path)
            
            if page_num < 0 or page_num >= len(doc):
                return []
            
            page = doc.load_page(page_num)
            blocks = page.get_text("dict")["blocks"]
            
            text_blocks = []
            for block in blocks:
                if "lines" in block:  # Text block
                    text = ""
                    for line in block["lines"]:
                        for span in line["spans"]:
                            text += span["text"]
                    
                    if text.strip():
                        text_blocks.append({
                            'text': text.strip(),
                            'bbox': block["bbox"],
                            'font': block["lines"][0]["spans"][0]["font"] if block["lines"] else "",
                            'size': block["lines"][0]["spans"][0]["size"] if block["lines"] else 0
                        })
            
            doc.close()
            return text_blocks
        
        except Exception as e:
            print(f"Error getting text blocks: {e}")
            return [] 