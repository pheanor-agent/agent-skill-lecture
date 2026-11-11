#!/usr/bin/env python3
"""녹취에서 할 일 후보 줄(기한·맡기 표현)을 뽑는다."""
import re, sys
KEYS = re.compile(r"(까지|맡을게|맡아|할게요|하기로|준비|정리해)")
for line in open(sys.argv[1], encoding="utf-8"):
    line = line.strip()
    if line and KEYS.search(line):
        print("-", line)
