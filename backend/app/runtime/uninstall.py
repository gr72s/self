from __future__ import annotations

import json
import subprocess
import sys
from typing import List


def _run_pip(args: List[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, "-m", "pip", *args],
        capture_output=True,
        text=True,
        check=False,
    )


def get_installed_self_packages() -> List[str]:
    result = _run_pip(["list", "--format=json"])
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "pip list failed")

    packages = json.loads(result.stdout)
    names = [pkg["name"] for pkg in packages if pkg["name"].lower().startswith("self-api")]
    return sorted(set(names))


def uninstall_self_packages() -> List[str]:
    packages = get_installed_self_packages()
    if not packages:
        return []

    for package in packages:
        # --break-system-packages is needed on some distros; retry without it when unsupported.
        result = _run_pip(["uninstall", "-y", package, "--break-system-packages"])
        if result.returncode != 0:
            fallback = _run_pip(["uninstall", "-y", package])
            if fallback.returncode != 0:
                stderr = fallback.stderr.strip() or result.stderr.strip()
                raise RuntimeError(f"Failed to uninstall {package}: {stderr}")

    return packages

