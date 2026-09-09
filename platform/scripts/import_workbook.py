"""Refresh the site snapshot from the user's workbook without modifying Excel.
Requires Python 3 and openpyxl. Run: python scripts/import_workbook.py PATH_TO_XLSX
"""
import argparse
import json
from pathlib import Path
import openpyxl

parser = argparse.ArgumentParser()
parser.add_argument('workbook', type=Path)
args = parser.parse_args()
book = openpyxl.load_workbook(args.workbook, read_only=True, data_only=True)
data = {}
for sheet in book:
    if sheet.title.startswith(('00_', '07_')):
        continue
    rows = iter(sheet.values)
    header = next(rows)
    data[sheet.title] = [dict(zip(header, row)) for row in rows if any(v is not None for v in row)]
records = data['01_遗产主表']
ids = [r['遗产ID'] for r in records]
assert len(ids) == len(set(ids)), 'Duplicate heritage IDs: review before import'
assert all(r['上级遗址ID'] in ids and r['子遗址ID'] in ids for r in data['02_遗址关系表']), 'Dangling relation'
output = Path(__file__).resolve().parents[1] / 'data' / 'catalog.json'
output.write_text(json.dumps(data, ensure_ascii=False, default=str), encoding='utf-8')
print(f'Imported {len(records)} records. Coordinate systems and historical claims still require review.')
