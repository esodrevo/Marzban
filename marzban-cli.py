#!/usr/bin/env python3
"""
Marzban CLI Wrapper
This script provides a simple entry point for the Marzban CLI.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

try:
    from cli.main import app

    app()
except ImportError as e:
    print(f"Error importing CLI: {e}")
    print("Make sure you're running this from the Marzban project directory.")
    sys.exit(1)
except Exception as e:
    print(f"Error running CLI: {e}")
    sys.exit(1)
