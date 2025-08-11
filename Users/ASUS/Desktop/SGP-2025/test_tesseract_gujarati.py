#!/usr/bin/env python3
"""
Test script to check Tesseract Gujarati support and OCR capabilities
"""

import pytesseract
import os
from PIL import Image, ImageDraw, ImageFont
import sys

def configure_tesseract():
    """Configure Tesseract path"""
    print("🔧 Configuring Tesseract...")
    
    # Set Tesseract path for Windows
    if os.name == 'nt':  # Windows
        tesseract_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        tessdata_path = r'C:\Program Files\Tesseract-OCR\tessdata'
        
        if os.path.exists(tesseract_path):
            os.environ['TESSDATA_PREFIX'] = tessdata_path
            pytesseract.pytesseract.tesseract_cmd = tesseract_path
            print(f"✅ Tesseract path set to: {tesseract_path}")
            return True
        else:
            print(f"❌ Tesseract not found at: {tesseract_path}")
            return False
    
    return True

def test_tesseract_installation():
    """Test if Tesseract is properly installed"""
    print("🔍 Testing Tesseract installation...")
    
    # Configure Tesseract first
    if not configure_tesseract():
        return False
    
    try:
        # Check Tesseract version
        version = pytesseract.get_tesseract_version()
        print(f"✅ Tesseract version: {version}")
        
        # Check available languages
        languages = pytesseract.get_languages()
        print(f"✅ Available languages: {languages}")
        
        # Check specifically for Gujarati
        if 'guj' in languages:
            print("✅ Gujarati language support is available!")
            return True
        else:
            print("❌ Gujarati language support is NOT available")
            print("   Available languages:", languages)
            return False
            
    except Exception as e:
        print(f"❌ Tesseract test failed: {e}")
        return False

def create_test_image():
    """Create a test image with Gujarati text"""
    print("\n🔍 Creating test image with Gujarati text...")
    
    # Create a white image
    img = Image.new('RGB', (800, 400), color='white')
    draw = ImageDraw.Draw(img)
    
    # Try to use a font that supports Gujarati
    try:
        # Try different font paths
        font_paths = [
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/calibri.ttf",
            "C:/Windows/Fonts/tahoma.ttf"
        ]
        
        font = None
        for font_path in font_paths:
            if os.path.exists(font_path):
                try:
                    font = ImageFont.truetype(font_path, 24)
                    break
                except:
                    continue
        
        if font is None:
            font = ImageFont.load_default()
            print("⚠️  Using default font (may not support Gujarati)")
        
        # Gujarati text sample
        gujarati_text = "ગુજરાતી ભાષા પરીક્ષણ"
        english_text = "Gujarati Language Test"
        
        # Draw text
        draw.text((50, 50), gujarati_text, fill='black', font=font)
        draw.text((50, 100), english_text, fill='black', font=font)
        
        # Save test image
        test_image_path = "test_gujarati.png"
        img.save(test_image_path)
        print(f"✅ Test image created: {test_image_path}")
        
        return test_image_path
        
    except Exception as e:
        print(f"❌ Error creating test image: {e}")
        return None

def test_gujarati_ocr(image_path):
    """Test OCR on Gujarati text"""
    print(f"\n🔍 Testing OCR on Gujarati text...")
    
    try:
        # Load the test image
        img = Image.open(image_path)
        
        # Test different OCR configurations
        configs = [
            ('--oem 3 --psm 6 -l guj+eng', 'Standard Gujarati+English'),
            ('--oem 3 --psm 3 -l guj+eng', 'Alternative PSM Gujarati+English'),
            ('--oem 1 --psm 6 -l guj+eng', 'Legacy Engine Gujarati+English'),
            ('--oem 3 --psm 6 -l guj', 'Gujarati only'),
            ('--oem 3 --psm 6 -l eng', 'English only (for comparison)')
        ]
        
        results = []
        for config, description in configs:
            try:
                text = pytesseract.image_to_string(img, config=config)
                text = text.strip()
                results.append((description, text))
                print(f"✅ {description}: {text[:50]}...")
            except Exception as e:
                print(f"❌ {description}: Failed - {e}")
        
        return results
        
    except Exception as e:
        print(f"❌ OCR test failed: {e}")
        return []

def main():
    """Run all tests"""
    print("🚀 Tesseract Gujarati OCR Test")
    print("=" * 50)
    
    # Test 1: Check Tesseract installation
    tesseract_ok = test_tesseract_installation()
    
    if not tesseract_ok:
        print("\n❌ Tesseract is not properly configured for Gujarati")
        print("🔧 Solutions:")
        print("   1. Install Tesseract with Gujarati language pack")
        print("   2. Download Gujarati language data from:")
        print("      https://github.com/tesseract-ocr/tessdata")
        print("   3. Place guj.traineddata in tessdata directory")
        return
    
    # Test 2: Create test image
    image_path = create_test_image()
    if not image_path:
        return
    
    # Test 3: Test OCR
    results = test_gujarati_ocr(image_path)
    
    if results:
        print("\n✅ OCR test completed successfully!")
        print("📝 Best results:")
        for description, text in results:
            if text:
                print(f"   {description}: {text}")
    else:
        print("\n❌ OCR test failed")
    
    # Cleanup
    if image_path and os.path.exists(image_path):
        os.remove(image_path)
        print(f"\n🧹 Cleaned up test image: {image_path}")

if __name__ == "__main__":
    main()
