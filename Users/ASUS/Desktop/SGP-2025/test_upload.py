#!/usr/bin/env python3
"""
Test script to diagnose PDF upload issues
"""

import requests
import os
import time
from pathlib import Path

# Configuration
API_BASE_URL = "http://localhost:8000"
TEST_PDF_PATH = "test_sample.pdf"  # You can change this to any PDF file

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Status: {response.json().get('status')}")
            print(f"   Uploads directory: {response.json().get('uploads_directory')}")
            print(f"   Models status: {response.json().get('models_status')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check error: {e}")
        return False

def test_api_status():
    """Test the basic API status"""
    print("\n🔍 Testing API status...")
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=10)
        if response.status_code == 200:
            print("✅ API is running")
            print(f"   Message: {response.json().get('message')}")
            return True
        else:
            print(f"❌ API status failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ API status error: {e}")
        return False

def test_pdf_upload(pdf_path):
    """Test PDF upload functionality"""
    print(f"\n🔍 Testing PDF upload with: {pdf_path}")
    
    if not os.path.exists(pdf_path):
        print(f"❌ Test PDF not found: {pdf_path}")
        return False
    
    file_size = os.path.getsize(pdf_path)
    print(f"   File size: {file_size / 1024 / 1024:.2f} MB")
    
    try:
        with open(pdf_path, 'rb') as f:
            files = {'file': (os.path.basename(pdf_path), f, 'application/pdf')}
            
            start_time = time.time()
            response = requests.post(
                f"{API_BASE_URL}/upload-pdf",
                files=files,
                timeout=300  # 5 minutes timeout
            )
            upload_time = time.time() - start_time
            
            if response.status_code == 200:
                result = response.json()
                print("✅ PDF upload successful!")
                print(f"   Upload time: {upload_time:.2f} seconds")
                print(f"   Processing time: {result.get('processing_time', 'N/A')} seconds")
                print(f"   Total pages: {result.get('total_pages', 'N/A')}")
                print(f"   Processing method: {result.get('processing_method', 'N/A')}")
                return True
            else:
                print(f"❌ PDF upload failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return False
                
    except requests.exceptions.RequestException as e:
        print(f"❌ PDF upload error: {e}")
        return False

def test_list_pdfs():
    """Test listing uploaded PDFs"""
    print("\n🔍 Testing PDF listing...")
    try:
        response = requests.get(f"{API_BASE_URL}/pdfs", timeout=10)
        if response.status_code == 200:
            pdfs = response.json().get('pdfs', [])
            print(f"✅ Found {len(pdfs)} uploaded PDFs")
            for pdf in pdfs:
                print(f"   - {pdf}")
            return True
        else:
            print(f"❌ PDF listing failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ PDF listing error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 PDF Upload Diagnostic Tool")
    print("=" * 50)
    
    # Test 1: Health check
    health_ok = test_health_check()
    
    # Test 2: API status
    api_ok = test_api_status()
    
    if not health_ok or not api_ok:
        print("\n❌ Basic API tests failed. Please check if the server is running.")
        print("   Start the server with: cd server && python main.py")
        return
    
    # Test 3: List existing PDFs
    test_list_pdfs()
    
    # Test 4: Upload test PDF
    if os.path.exists(TEST_PDF_PATH):
        upload_ok = test_pdf_upload(TEST_PDF_PATH)
        if upload_ok:
            print("\n✅ All tests passed! Upload functionality is working correctly.")
        else:
            print("\n❌ Upload test failed. Check the error messages above.")
    else:
        print(f"\n⚠️  Test PDF not found: {TEST_PDF_PATH}")
        print("   Please place a PDF file named 'test_sample.pdf' in the current directory")
        print("   or modify the TEST_PDF_PATH variable in this script.")
    
    print("\n" + "=" * 50)
    print("🔧 Troubleshooting tips:")
    print("   1. Make sure the server is running on http://localhost:8000")
    print("   2. Check if the uploads directory exists and is writable")
    print("   3. Verify that Tesseract is installed and accessible")
    print("   4. Check server logs for detailed error messages")
    print("   5. Ensure PDF files are not corrupted or password-protected")

if __name__ == "__main__":
    main()
