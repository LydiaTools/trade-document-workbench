# Trade Document Workbench

[Open the workbench](https://lydiatools.github.io/trade-document-workbench/) · [Download the offline version](https://github.com/LydiaTools/trade-document-workbench/releases/latest)

**Enter the order once. Spend less time updating the same details across five documents.**

A customer changes the quantity. You update the quote, proforma invoice, contract and commercial invoice, then check whether the factory's packing sheet still matches.

Trade Document Workbench keeps that work in one local browser workspace. Reuse one order across five document types, keep actual packing records separate, and check quantities before exporting.

**v2.0.1 · Runs locally · Chinese interface · English, Chinese and bilingual documents**

[中文介绍](../README.md) · [Development notes](DEVELOPMENT.md)

## Start with one order

1. Open `dist/单证工作台.html`, enter the seller, and select or add a buyer.
2. Add products and review quantities, prices and trade terms.
3. Preview the quotation, proforma invoice, sales contract, commercial invoice and packing list.
4. Review packing records and document checks, then export one PDF or a ZIP containing all five PDFs.
5. Keep a historical version and download a full backup before moving to another browser or computer.

The standalone HTML includes its scripts, styles and libraries. No account, API key or dependency installation is needed. Initial records are illustrative examples.

To use a local address, run this from the repository root:

```sh
python3 -m http.server 8769 --bind 127.0.0.1 --directory src
```

Then open <http://127.0.0.1:8769/>.

## Count the mixed carton once

Order quantities and actual packing records are stored separately. A change to the order does not silently rewrite the factory's packing entries.

For example, 25 units of product A and 13 units of product B can use two full cartons containing 24 and 12 units, plus one mixed carton containing the remaining unit of each. That is **three physical cartons**. The mixed carton's count, weight and volume are included once.

Shortages, excess quantities, overlapping carton ranges and inconsistent physical carton data are reported. Invalid packing blocks the packing list and full PDF set; quotation work can continue.

## Keep the next order easier

- Product and customer libraries, product CSV import, and factory CSV / spreadsheet-paste input.
- Five document types, three document-language modes and nine color themes.
- Per-line monetary rounding and explicit input checks; changing currency does not convert exchange rates.
- Historical versions, repeat orders and complete JSON backups.
- Local browser storage; different browsers and origins have separate workspaces.

Free-form text is not translated. PDFs contain rasterized document content. The current version does not provide cloud collaboration, OCR, customs declarations or 3D container loading.

## Release verification

On 21 October 2026, all **18 checks passed**. Desktop Chrome and Safari were used to verify document downloads, packing reconciliation, shortage blocking, backup/restore, product import and customer records. All five sample document types, an actual mixed-carton packing list and a bilingual contract were rendered and visually inspected.

The public page uses the Lydia logo and favicon. Backup/help controls are available in a 390 × 844 responsive view. Physical phones and embedded social-app browsers have not been tested. See the [detailed release checks](QA.md).

Bundled dependency licenses are retained under [`src/vendor`](../src/vendor); see [third-party notices](../THIRD_PARTY_NOTICES.md).
