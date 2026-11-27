# Exports

Generated from `UpnRoll_Complete_Project_Handover.md` on **2026-11-27** using Microsoft Word automation (HTML intermediate → DOCX / PDF).

| File | Format | Notes |
|------|--------|-------|
| `UpnRoll_Complete_Project_Handover.docx` | Word | Editable; Mermaid diagrams appear as fenced source text |
| `UpnRoll_Complete_Project_Handover.pdf` | PDF | Printable; Mermaid diagrams appear as fenced source text |
| `UpnRoll_Complete_Project_Handover.html` | HTML | Intermediate used for Word import (kept for re-export) |

## Re-export instructions (Windows + Microsoft Word)

```powershell
cd d:\upnrol
# If HTML is stale, regenerate from Markdown using the handover export script approach,
# or open the .md in VS Code / Obsidian and export.
$html = (Resolve-Path .\docs\handover\exports\UpnRoll_Complete_Project_Handover.html).Path
$docx = (Join-Path (Resolve-Path .\docs\handover\exports).Path 'UpnRoll_Complete_Project_Handover.docx')
$pdf  = (Join-Path (Resolve-Path .\docs\handover\exports).Path 'UpnRoll_Complete_Project_Handover.pdf')
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open($html)
$doc.SaveAs([string]$docx, 12)          # wdFormatXMLDocument
$doc.ExportAsFixedFormat([string]$pdf, 17)  # wdExportFormatPDF
$doc.Close($false)
$word.Quit()
```

## Alternative: Pandoc (if installed)

```bash
pandoc docs/handover/UpnRoll_Complete_Project_Handover.md -o docs/handover/exports/UpnRoll_Complete_Project_Handover.docx
pandoc docs/handover/UpnRoll_Complete_Project_Handover.md -o docs/handover/exports/UpnRoll_Complete_Project_Handover.pdf
```

**Note:** Mermaid diagrams render in GitHub/Cursor Markdown preview; Word/PDF exports show diagram source unless a Mermaid renderer is used separately.
