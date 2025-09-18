#!/usr/bin/env python3
"""
ZType Game Launcher
Simple launcher script for the ZType typing game
"""

import sys
import os

# Add current directory to path to ensure imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

try:
    from ptype import main
    
    if __name__ == "__main__":
        print("=" * 50)
        print("          ZTYPE - TYPE TO SHOOT!")
        print("=" * 50)
        print()
        main()
        
except ImportError as e:
    print(f"Error importing game: {e}")
    print("Make sure pygame is installed: pip install pygame")
    sys.exit(1)
except Exception as e:
    print(f"Error running game: {e}")
    sys.exit(1)