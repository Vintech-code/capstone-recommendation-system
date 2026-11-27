# Recommendation and Enrollment Alignment DOCX Template Contract

## Reference

- Source: `C:\Users\User\OneDrive\ドキュメント\New folder\OneDrive\Desktop\riasec-report1.docx`
- SHA-256: `156DFCAD0BD5B080F3AD383558C12256420417378D6B31F892540A6000591191`
- Expected page count before body population: 1
- Section count: 1
- Package evidence: `.tmp/riasec-report1-distill/package`

## Page system

- Legal portrait page, 12240 by 18720 twips (8.5 by 13 inches).
- Margins: 1440 twips (1 inch) on every side.
- Header and footer distance: 720 twips (0.5 inch).
- One continuous section with one column and no separate first/even-page header behavior.

## Preserved template components

- `word/header1.xml`: preserve byte-for-byte. It contains the two embedded institutional logos and the supplied institutional heading text.
- `word/footer1.xml`: preserve byte-for-byte. It contains the maroon footer rule and no page-number field.
- `word/media/image1.png` and `word/media/image2.png`: preserve byte-for-byte.
- Relationships, content types, styles, numbering, theme, settings, custom XML, document properties, footnotes, and endnotes: preserve byte-for-byte.

## Editable slot

- `word/document.xml` body before the existing final `w:sectPr` is the only editable package location.
- The supplied body contains 12 empty centered paragraphs, no visible text, no table, no field, and no content control.
- Replace those empty paragraphs with the generated report title, reporting metadata, explanatory scope, summary table, programme alignment table, alternative-programme destination rows, overall row, and evidence note.
- Preserve the existing final `w:sectPr` unchanged so the header, footer, page size, and margins continue to apply.

## Generated body system

- Use Times New Roman to remain source-derived from the supplied body defaults.
- Use black titles and headings. Use the footer's maroon `650710` only for table-header fill, with white header text.
- Use light-gray `D9D9D9` table borders, expandable rows, deliberate cell padding, and vertically centered cells.
- Keep the programme table within the 9360-twip content width. Present alternative programme destinations in a full-width row directly beneath the corresponding recommended programme.
- Repeat the programme table header on continuation pages.

## Fidelity gates

- The source and repository copy hashes must match before generation.
- Only `word/document.xml` may differ between the template and generated document.
- The generated package must open as a DOCX, preserve all original package entries, contain no Student identity, and contain the requested aggregate fields.
- Render and visually inspect every generated page before delivery; verify header/footer placement, table wrapping, pagination, and absence of clipping or overlap.
