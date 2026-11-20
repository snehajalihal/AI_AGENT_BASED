
import json
import subprocess


def discover_local_devices():
    """
    Retrieve recently known IPv4 neighbor devices
    from the local Windows network interfaces.

    This uses the Windows neighbor cache.
    It does not scan external networks or ports.
    """

    command = """
    Get-NetNeighbor -AddressFamily IPv4 |
    Where-Object {
        $_.IPAddress -notlike "224.*" -and
        $_.IPAddress -notlike "239.*" -and
        $_.IPAddress -ne "255.255.255.255" -and
        $_.LinkLayerAddress -ne "00-00-00-00-00-00"
    } |
    Select-Object IPAddress, LinkLayerAddress, State, InterfaceAlias |
    ConvertTo-Json -Compress
    """

    try:
        result = subprocess.run(
            [
                "powershell.exe",
                "-NoProfile",
                "-NonInteractive",
                "-Command",
                command
            ],
            capture_output=True,
            text=True,
            timeout=15
        )

        if result.returncode != 0:
            raise RuntimeError(
                result.stderr.strip() or "Network discovery failed"
            )

        if not result.stdout.strip():
            return {
                "success": True,
                "total_devices": 0,
                "devices": [],
                "message": "No devices found in the Windows neighbor cache"
            }

        data = json.loads(result.stdout)

        if isinstance(data, dict):
            data = [data]

        devices = []

        for device in data:
            ip_address = device.get("IPAddress")
            mac_address = device.get("LinkLayerAddress")

            if not ip_address:
                continue

            devices.append({
                "ip_address": ip_address,
                "mac_address": mac_address or "Unavailable",
                "status": device.get("State", "Unknown"),
                "interface": device.get(
                    "InterfaceAlias",
                    "Unknown"
                )
            })

        return {
            "success": True,
            "total_devices": len(devices),
            "devices": devices,
            "message": "Local network discovery completed"
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "total_devices": 0,
            "devices": [],
            "message": "Network discovery timed out"
        }

    except Exception as error:
        return {
            "success": False,
            "total_devices": 0,
            "devices": [],
            "message": str(error)
        }
