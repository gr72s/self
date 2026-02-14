#!/usr/bin/env python3
"""
Script to uninstall all versions of self-api package
"""

import subprocess
import sys

def run_command(cmd):
    """Run a command and return output"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True
        )
        return result.returncode, result.stdout, result.stderr
    except Exception as e:
        return 1, '', str(e)

def get_installed_self_packages():
    """Get all installed self-api packages"""
    code, stdout, stderr = run_command('pip list | grep self-api')
    packages = []
    if code == 0 and stdout:
        for line in stdout.strip().split('\n'):
            parts = line.split()
            if len(parts) >= 2:
                packages.append(parts[0])
    return packages

def uninstall_package(package_name):
    """Uninstall a package"""
    print(f"Uninstalling {package_name}...")
    code, stdout, stderr = run_command(f'pip uninstall -y {package_name} --break-system-packages')
    if code == 0:
        print(f"Successfully uninstalled {package_name}")
    else:
        print(f"Failed to uninstall {package_name}: {stderr}")
    return code == 0

def main():
    """Main function"""
    print("Checking for installed self-api packages...")
    
    # Get all installed self-api packages
    packages = get_installed_self_packages()
    
    if not packages:
        print("No self-api packages found.")
        return
    
    print(f"Found {len(packages)} self-api package(s): {', '.join(packages)}")
    
    # Uninstall each package
    success = True
    for package in packages:
        if not uninstall_package(package):
            success = False
    
    # Also try to uninstall using the exact package name
    print("\nTrying to uninstall using exact package name...")
    uninstall_package('self-api')
    
    # Verify uninstallation
    print("\nVerifying uninstallation...")
    remaining_packages = get_installed_self_packages()
    
    if not remaining_packages:
        print("\n✅ All self-api packages have been successfully uninstalled!")
    else:
        print(f"\n❌ Some self-api packages still remain: {', '.join(remaining_packages)}")
        print("You may need to uninstall them manually.")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())