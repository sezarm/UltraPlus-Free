#!/usr/bin/env python3
"""UltraPlus-Free compiler
Usage:
  python build.py
Reads worker.source.js -> writes worker.compiled.js and worker.js (deploy this)
"""
import re, base64, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "worker.source.js"
OUT = ROOT / "worker.compiled.js"
OUT2 = ROOT / "worker.js"

def build(source: str) -> str:
    header = (
        "/** UltraPlus-Free COMPILED - do not edit. Edit worker.source.js then rebuild. */\n"
        "/* build: obfuscated-minify v1 */\n"
    )
    code = re.sub(r"^/\*[\s\S]*?\*/\s*", "", source, count=1)
    lines = []
    for line in code.splitlines():
        if line.strip().startswith("//"):
            continue
        lines.append(line)
    code = "\n".join(lines)
    code = re.sub(r"[ \t]+", " ", code)
    code = re.sub(r"\n\s*\n+", "\n", code)
    code = re.sub(r" *\n *", "\n", code).strip()
    pairs = [
        ("proxyStats", "_ps"), ("uuidActive", "_ua"), ("uuidLastSeen", "_ul"),
        ("uuidSessions", "_us"), ("authFailMap", "_af"), ("adminLog", "_al"),
        ("memoryUsers", "_mu"), ("MAX_ACTIVE", "_MA"), ("pushLog", "_pl"),
        ("noteAuthFail", "_naf"), ("isIpBlocked", "_iib"), ("clientIp", "_cip"),
    ]
    for a, b in pairs:
        code = re.sub(r"\b" + a + r"\b", b, code)
    noise = base64.b64encode(b"UltraPlus-Free compiled - edit worker.source.js").decode()
    return header + "const _B=atob('" + noise + "');\n" + code

def main():
    if not SRC.exists():
        print("Missing", SRC)
        sys.exit(1)
    text = SRC.read_text(encoding="utf-8")
    out = build(text)
    if "export default" not in out:
        print("Build failed: export default missing")
        sys.exit(1)
    OUT.write_text(out, encoding="utf-8")
    OUT2.write_text(out, encoding="utf-8")
    print("OK", len(text), "->", len(out), "bytes")
    print("Deploy:", OUT2)

if __name__ == "__main__":
    main()
