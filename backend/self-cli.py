#!/usr/bin/env python3
"""Self API CLI executable script"""

import sys
import os

# 添加当前目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from cli.main import self_cli

if __name__ == "__main__":
    self_cli()