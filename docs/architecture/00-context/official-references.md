# DOC-OFFICIAL — Official reference register

- Document ID: `DOC-OFFICIAL`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Verified primary documentation consulted in this iteration.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| ID | Primary source | URL | Limited use |
|---|---|---|---|
| OFF-01 | Tesseract release 5.5.3 | [Tesseract release 5.5.3](https://github.com/tesseract-ocr/tesseract/releases/tag/5.5.3) | Release version observed; not installed as app dependency |
| OFF-02 | EasyOCR official repository | [EasyOCR official repository](https://github.com/JaidedAI/EasyOCR) | PyTorch-based OCR; CPU mode and model downloads documented; Apache-2.0 |
| OFF-03 | PaddleOCR official repository | [PaddleOCR official repository](https://github.com/PaddlePaddle/PaddleOCR) | OCR toolkit; inference/runtime requirements require specific model/runtime pin |
| OFF-04 | OpenCV license | [OpenCV license](https://opencv.org/license/) | 4.5+ Apache-2.0; image preprocessing, not expiry/domain inference |
| OFF-05 | express-session docs | [express-session docs](https://expressjs.com/en/resources/middleware/session/) | Session data held server-side; default MemoryStore not intended for production |
| OFF-06 | OWASP session management | [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) | Session credential lifecycle, cookie protections and rotation/revocation guidance |
| OFF-07 | OWASP CSRF prevention | [OWASP CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) | Cookie-auth state changes need CSRF design; SameSite alone is not entire protection |
| OFF-08 | Google Analytics events | [Google Analytics events](https://developers.google.com/analytics/devguides/collection/ga4/events) | Event setup; product event choice/consent remain project decisions |
| OFF-09 | PostgreSQL row locking | [PostgreSQL row locking](https://www.postgresql.org/docs/current/explicit-locking.html) | Locking must be within chosen transaction design |
| OFF-10 | Prisma transactions | [Prisma transactions](https://www.prisma.io/docs/orm/fundamentals/transactions) | Candidate transaction API; evaluate exact lock/raw query path in spike |
| OFF-11 | Sequelize transactions | [Sequelize transactions](https://sequelize.org/docs/v6/other-topics/transactions/) | Candidate managed/unmanaged transaction behavior; evaluate on chosen DB |
| OFF-12 | OpenAPI 3.1.1 | [OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html) | Machine-readable HTTP/schema contract, not running server |
| OFF-13 | OMG UML 2.5.1 | [OMG UML 2.5.1](https://www.omg.org/spec/UML/2.5.1) | Notation specification; Mermaid flowchart not a native UML use-case diagram |

Access date 09/10/2026. Versions/licenses below are registry/release metadata and candidates, not runtime compatibility tested in Expiry. Avoid importing benchmark numbers from generic documents into food-label acceptance targets.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [04-technology-research/ocr-research.md](ocr-research.md)
- [07-api/authentication.md](../07-api/authentication.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [04-technology-research/ocr-research.md](ocr-research.md)
- [07-api/authentication.md](../07-api/authentication.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
