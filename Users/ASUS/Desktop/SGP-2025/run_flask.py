#!/usr/bin/env python3
"""
Script to install Flask dependencies and run the PDF Search application
"""

import subprocess
import sys
import os

def install_requirements():
    """Install Flask requirements"""
    print("Installing Flask requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements_flask.txt"])
        print("Requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Error installing requirements: {e}")
        return False
    return True

def run_flask_app():
    """Run the Flask application"""
    print("Starting Flask application...")
    try:
        # Set environment variables
        os.environ['FLASK_APP'] = 'app.py'
        os.environ['FLASK_ENV'] = 'development'
        
        # Run Flask app
        subprocess.run([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\nApplication stopped by user")
    except Exception as e:
        print(f"Error running Flask app: {e}")

if __name__ == "__main__":
    print("PDF Search App - Flask Version")
    print("=" * 40)
    
    # Check if requirements need to be installed
    if not os.path.exists("requirements_flask.txt"):
        print("Error: requirements_flask.txt not found!")
        sys.exit(1)
    
    # Install requirements
    if install_requirements():
        print("\nStarting the application...")
        print("The app will be available at: http://localhost:5000")
        print("Press Ctrl+C to stop the application")
        print("-" * 40)
        run_flask_app()
    else:
        print("Failed to install requirements. Please check your Python environment.")
        sys.exit(1) 