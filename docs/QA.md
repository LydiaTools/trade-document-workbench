# Release checks — v2.0.1

Verified on 21 October 2026 using synthetic sample data.

| Check | Observed result |
| --- | --- |
| Core arithmetic and packing tests | All 18 existing Node.js checks passed. |
| Public HTTPS entry | HTTP 200; served HTML matches the release build SHA-256. |
| Lydia branding | Logo and favicon visible in the public Safari page; images are embedded in the offline HTML. |
| Full document set | Chrome downloaded a ZIP containing quotation, proforma invoice, contract, commercial invoice and packing-list PDFs. All five rendered as readable A4 pages. |
| Single PDF | Safari downloaded a quotation, an actual-packing list and a bilingual contract. Rendered files were visually checked. |
| Order edits | 25 × 8.50 + 13 × 12.80 = USD 378.90. Offline Safari reload preserved the edited order. |
| Mixed cartons | Spreadsheet-paste import produced 38 units in three physical cartons, 18.360 kg net, 20.660 kg gross and 0.094288 m³. The mixed carton's physical totals appeared once. |
| Changed order | Changing 25 units to 26 preserved the actual packing and blocked the full export with a one-unit shortage. |
| Factory tables | ZIP contained re-importable packing details, per-carton totals and order reconciliation CSVs; totals matched the packing screen. |
| Backup and restore | Downloaded JSON restored the original 25/13 quantities and all three packing groups after the quantity change. |
| Document language | Bilingual contract preview and exported PDF contained both product names and document labels. Free-form terms remained unchanged. |
| Product library | A CSV product was imported and added to the current order. |
| Customer library | Missing address was rejected; a complete synthetic customer was saved and selected for the current order. |
| History | Export and restore snapshots remained visible after subsequent edits. |
| Narrow layout | Safari responsive view at 390 × 844 showed the logo, navigation, backup/help controls, form and document preview. |

This verifies desktop Chrome and Safari workflows and a simulated narrow viewport. Physical iOS/Android devices, embedded social-app browsers and every browser version have not been tested. Browser storage is local to the browser/origin; users should download backups before clearing data or changing devices. PDFs contain rasterized content.

The v2.0.1 update changes application branding, favicon, mobile backup/help access and documentation. It does not change the calculation or document-generation logic.
