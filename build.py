#!/usr/bin/env python3
"""UltraPlus-Free compiler (stronger obfuscation v2)
Usage: python3 build.py
  worker.source.js -> worker.compiled.js + worker.js
"""
import re, base64, sys, pathlib, hashlib, random

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "worker.source.js"
OUT = ROOT / "worker.compiled.js"
OUT2 = ROOT / "worker.js"

KEEP = {
    "fetch", "request", "env", "export", "default", "async", "await", "function",
    "return", "const", "let", "var", "if", "else", "for", "while", "try", "catch",
    "new", "this", "true", "false", "null", "undefined", "typeof", "instanceof",
    "Object", "Array", "Date", "JSON", "Math", "String", "Number", "Boolean",
    "Promise", "Response", "Headers", "URL", "FormData", "Uint8Array", "TextDecoder",
    "WebSocketPair", "btoa", "atob", "parseInt", "parseFloat", "encodeURIComponent",
    "decodeURIComponent", "unescape", "isNaN", "Infinity", "console", "Error",
    "import", "from", "of", "in", "class", "static", "get", "set", "throw",
    "break", "continue", "switch", "case", "do", "with", "yield",
    "delete", "void", "super", "extends", "finally", "debugger",
}

def gen_name(i: int) -> str:
    h = hashlib.md5(f"up{i}".encode()).hexdigest()
    return "_0x" + h[:7]

def strip_line_comments(code: str) -> str:
    lines = []
    for line in code.splitlines():
        if line.strip().startswith("//"):
            continue
        lines.append(line)
    return "\n".join(lines)

def minify(code: str) -> str:
    code = re.sub(r"[ \t]+", " ", code)
    code = re.sub(r"\n\s*\n+", "\n", code)
    code = re.sub(r" *\n *", "\n", code)
    return code.strip()

def rename_functions(code: str) -> str:
    funcs = re.findall(r"\bfunction\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(", code)
    funcs += re.findall(r"\basync function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(", code)
    seen = set()
    ordered = []
    for f in funcs:
        if f not in seen:
            seen.add(f)
            ordered.append(f)
    mapping = {}
    i = 0
    for f in ordered:
        if f in KEEP or f.startswith("_0x"):
            continue
        mapping[f] = gen_name(i)
        i += 1
    for old in sorted(mapping.keys(), key=len, reverse=True):
        code = re.sub(r"\b" + re.escape(old) + r"\b", mapping[old], code)
    return code, mapping

def rename_vars(code: str) -> str:
    pairs = [
        ("proxyStats", gen_name(100)), ("uuidActive", gen_name(101)),
        ("uuidLastSeen", gen_name(102)), ("uuidSessions", gen_name(103)),
        ("authFailMap", gen_name(104)), ("adminLog", gen_name(105)),
        ("memoryUsers", gen_name(106)), ("MAX_ACTIVE", gen_name(107)),
        ("LANGUAGES", gen_name(108)), ("translations", gen_name(109)),
    ]
    for a, b in pairs:
        code = re.sub(r"\b" + a + r"\b", b, code)
    return code

def build(source: str) -> str:
    header = (
        "/** UltraPlus-Free COMPILED v2 - DO NOT EDIT */\n"
        "/** Source: worker.source.js | Rebuild: python3 build.py */\n"
    )
    code = re.sub(r"^/\*[\s\S]*?\*/\s*", "", source, count=1)
    code = strip_line_comments(code)
    code = minify(code)
    code, fmap = rename_functions(code)
    code = rename_vars(code)
    junk = "var _0xdead=%d,_0xbeef=%d;void(_0xdead+_0xbeef);\n" % (
        random.randint(1000000, 9000000), random.randint(1000000, 9000000)
    )
    token = base64.b64encode(b"UltraPlus-Free protected build").decode()
    banner = "const _UP=atob('" + token + "');\n" + junk
    out = header + banner + code
    if "export default" not in out:
        raise RuntimeError("export default missing after obfuscation")
    return out

def main():
    random.seed()
    if not SRC.exists():
        print("Missing", SRC)
        sys.exit(1)
    text = SRC.read_text(encoding="utf-8")
    out = build(text)
    OUT.write_text(out, encoding="utf-8")
    OUT2.write_text(out, encoding="utf-8")
    print("OK source", len(text), "-> compiled", len(out))
    print("Deploy file:", OUT2.name)

if __name__ == "__main__":
    main()
