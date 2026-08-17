"""Windows Credential Manager access for the local Agent Memory gateway."""

from __future__ import annotations

import argparse
import base64
import ctypes
from ctypes import wintypes
import secrets


CRED_TYPE_GENERIC = 1
CRED_PERSIST_LOCAL_MACHINE = 2
DEFAULT_TARGET = "Codex/AgentMemory/Gateway"


class FILETIME(ctypes.Structure):
    _fields_ = [("dwLowDateTime", wintypes.DWORD), ("dwHighDateTime", wintypes.DWORD)]


class CREDENTIAL(ctypes.Structure):
    _fields_ = [
        ("Flags", wintypes.DWORD),
        ("Type", wintypes.DWORD),
        ("TargetName", wintypes.LPWSTR),
        ("Comment", wintypes.LPWSTR),
        ("LastWritten", FILETIME),
        ("CredentialBlobSize", wintypes.DWORD),
        ("CredentialBlob", ctypes.c_void_p),
        ("Persist", wintypes.DWORD),
        ("AttributeCount", wintypes.DWORD),
        ("Attributes", ctypes.c_void_p),
        ("TargetAlias", wintypes.LPWSTR),
        ("UserName", wintypes.LPWSTR),
    ]


advapi32 = ctypes.WinDLL("Advapi32.dll", use_last_error=True)
advapi32.CredReadW.argtypes = [wintypes.LPCWSTR, wintypes.DWORD, wintypes.DWORD, ctypes.POINTER(ctypes.c_void_p)]
advapi32.CredReadW.restype = wintypes.BOOL
advapi32.CredWriteW.argtypes = [ctypes.POINTER(CREDENTIAL), wintypes.DWORD]
advapi32.CredWriteW.restype = wintypes.BOOL
advapi32.CredFree.argtypes = [ctypes.c_void_p]


def read_credential(target: str = DEFAULT_TARGET) -> str | None:
    pointer = ctypes.c_void_p()
    if not advapi32.CredReadW(target, CRED_TYPE_GENERIC, 0, ctypes.byref(pointer)):
        error = ctypes.get_last_error()
        if error == 1168:
            return None
        raise ctypes.WinError(error)
    try:
        credential = ctypes.cast(pointer, ctypes.POINTER(CREDENTIAL)).contents
        if not credential.CredentialBlob or credential.CredentialBlobSize == 0:
            return ""
        raw = ctypes.string_at(credential.CredentialBlob, credential.CredentialBlobSize)
        return raw.decode("utf-16-le")
    finally:
        advapi32.CredFree(pointer)


def write_credential(secret: str, target: str = DEFAULT_TARGET) -> None:
    raw = secret.encode("utf-16-le")
    buffer = ctypes.create_string_buffer(raw, len(raw))
    credential = CREDENTIAL()
    credential.Type = CRED_TYPE_GENERIC
    credential.TargetName = target
    credential.CredentialBlobSize = len(raw)
    credential.CredentialBlob = ctypes.cast(buffer, ctypes.c_void_p)
    credential.Persist = CRED_PERSIST_LOCAL_MACHINE
    credential.UserName = "dillon-os-agent-memory"
    if not advapi32.CredWriteW(ctypes.byref(credential), 0):
        raise ctypes.WinError(ctypes.get_last_error())


def ensure_credential(target: str = DEFAULT_TARGET) -> bool:
    if read_credential(target):
        return False
    token = base64.urlsafe_b64encode(secrets.token_bytes(48)).decode("ascii").rstrip("=")
    write_credential(token, target)
    return True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=("ensure", "get", "exists"))
    parser.add_argument("--target", default=DEFAULT_TARGET)
    args = parser.parse_args()
    if args.action == "ensure":
        created = ensure_credential(args.target)
        print("created" if created else "present")
        return 0
    value = read_credential(args.target)
    if args.action == "exists":
        print("true" if value else "false")
        return 0 if value else 1
    if value is None:
        return 2
    print(value, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

