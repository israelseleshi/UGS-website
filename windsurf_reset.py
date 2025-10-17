#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Windsurf Machine ID Modifier Tool
Automatically modifies machine identification information in the Windsurf configuration file
"""

import os
import json
import uuid
import random
import string
import stat
from pathlib import Path
import sys
import subprocess
import time


class WindsurfMachineIdModifier:
    """Windsurf Machine ID Modifier"""

    def __init__(self):
        self.appdata_path = os.getenv('APPDATA')
        self.storage_file_path = None

    def check_environment(self):
        """Check running environment"""
        print("🔍 Checking running environment...")

        # Check operating system
        if os.name != 'nt':
            print("❌ Error: This program only supports Windows")
            return False

        # Check APPDATA environment variable
        if not self.appdata_path:
            print("❌ Error: Cannot get APPDATA environment variable")
            return False

        print(f"✅ APPDATA path: {self.appdata_path}")

        # Build target file path
        self.storage_file_path = Path(self.appdata_path) / "Windsurf" / "User" / "globalStorage" / "storage.json"

        print(f"🎯 Target file: {self.storage_file_path}")

        # Check if file exists
        if not self.storage_file_path.exists():
            print(f"❌ Error: Target file does not exist: {self.storage_file_path}")
            return False

        print("✅ Target file exists")
        return True

    def detect_windsurf_processes(self):
        """Detect Windsurf related processes"""
        print("🔍 Scanning Windsurf related processes...")
        windsurf_processes = []
        process_names = ['Windsurf.exe', 'Code.exe', 'code.exe']

        for process_name in process_names:
            try:
                result = subprocess.run(
                    ['tasklist', '/FI', f'IMAGENAME eq {process_name}'],
                    capture_output=True, text=True, check=True
                )
                # Check if output contains process name (case insensitive)
                if process_name.lower() in result.stdout.lower() and "INFO: No tasks" not in result.stdout:
                    windsurf_processes.append(process_name)
                    print(f"  🔍 Discovered process: {process_name}")
            except subprocess.CalledProcessError:
                continue

        return windsurf_processes

    def kill_windsurf_processes(self, process_list):
        """Terminate Windsurf processes"""
        print("🔄 Closing Windsurf processes...")
        success_count = 0

        for process_name in process_list:
            try:
                subprocess.run(
                    ['taskkill', '/F', '/IM', process_name],
                    capture_output=True, text=True, check=True
                )
                print(f"  ✅ Terminated process: {process_name}")
                success_count += 1
            except subprocess.CalledProcessError:
                print(f"  ❌ Failed to terminate process: {process_name}")
                continue

        return success_count == len(process_list)

    def check_and_close_windsurf(self):
        """Check and close Windsurf processes"""
        processes = self.detect_windsurf_processes()

        if not processes:
            print("✅ No Windsurf processes found")
            return True

        print(f"⚠️  Found running Windsurf processes: {', '.join(processes)}")

        if self.kill_windsurf_processes(processes):
            print("✅ All Windsurf processes closed")
            print("⏳ Waiting for file lock release...")
            time.sleep(3)  # Wait for file lock release
            return True
        else:
            print("❌ Some processes failed to close, please close manually and retry")
            return False

    def generate_machine_id(self):
        """Generate 32-character hexadecimal machine ID"""
        return ''.join(random.choices(string.hexdigits.lower(), k=32))

    def generate_sqm_id(self):
        """Generate standard UUID format SQM ID (with braces)"""
        return "{" + str(uuid.uuid4()).upper() + "}"

    def generate_dev_device_id(self):
        """Generate 32-character hexadecimal device ID"""
        return ''.join(random.choices(string.hexdigits.lower(), k=32))

    def read_storage_file(self):
        """Read storage.json file"""
        print("📖 Reading config file...")
        try:
            with open(self.storage_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print("✅ Config file read successfully")
            return data
        except json.JSONDecodeError as e:
            print(f"❌ JSON format error: {e}")
            return None
        except Exception as e:
            print(f"❌ Failed to read file: {e}")
            return None

    def modify_machine_ids(self, data):
        """Modify machine identification information"""
        print("🔧 Generating new machine identifiers...")

        # Generate new random values
        new_machine_id = self.generate_machine_id()
        new_sqm_id = self.generate_sqm_id()
        new_dev_device_id = self.generate_dev_device_id()

        # Display original values (if present)
        print("\n📋 Original values:")
        print(f"  telemetry.machineId: {data.get('telemetry.machineId', 'Not set')}")
        print(f"  telemetry.sqmId: {data.get('telemetry.sqmId', 'Not set')}")
        print(f"  telemetry.devDeviceId: {data.get('telemetry.devDeviceId', 'Not set')}")

        # Modify values
        data['telemetry.machineId'] = new_machine_id
        data['telemetry.sqmId'] = new_sqm_id
        data['telemetry.devDeviceId'] = new_dev_device_id

        # Display new values
        print("\n🆕 New values:")
        print(f"  telemetry.machineId: {new_machine_id}")
        print(f"  telemetry.sqmId: {new_sqm_id}")
        print(f"  telemetry.devDeviceId: {new_dev_device_id}")

        return data

    def write_storage_file(self, data):
        """Write modified data to file"""
        print("\n💾 Saving modified config...")
        try:
            # First remove read-only attribute (if any)
            if self.storage_file_path.exists():
                os.chmod(self.storage_file_path, stat.S_IWRITE | stat.S_IREAD)

            with open(self.storage_file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print("✅ Config file saved successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to save file: {e}")
            return False

    def set_readonly(self):
        """Set file to read-only"""
        print("🔒 Setting file to read-only...")
        try:
            os.chmod(self.storage_file_path, stat.S_IREAD)
            print("✅ File set to read-only")
            return True
        except Exception as e:
            print(f"❌ Failed to set read-only: {e}")
            return False

    def run(self):
        """Run main program"""
        print("🚀 Windsurf Machine ID Modifier Tool started")
        print("=" * 50)

        # Check environment
        if not self.check_environment():
            return False

        # Check and close Windsurf processes
        if not self.check_and_close_windsurf():
            return False

        # Read config file
        data = self.read_storage_file()
        if data is None:
            return False

        # Modify machine identifiers
        modified_data = self.modify_machine_ids(data)

        # Save modifications
        if not self.write_storage_file(modified_data):
            return False

        # Set read-only
        if not self.set_readonly():
            return False

        print("\n" + "=" * 50)
        print("🎉 Machine ID modification complete!")
        print("⚠️  Note: File set to read-only, to modify again please remove read-only first")

        return True


def main():
    """Main function"""
    try:
        modifier = WindsurfMachineIdModifier()
        success = modifier.run()

        if success:
            print("\nPress any key to exit...")
            input()
            sys.exit(0)
        else:
            print("\nProgram execution failed, press any key to exit...")
            input()
            sys.exit(1)

    except KeyboardInterrupt:
        print("\n\nProgram interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\nProgram execution error: {e}")
        print("Press any key to exit...")
        input()
        sys.exit(1)


if __name__ == "__main__":
    main()