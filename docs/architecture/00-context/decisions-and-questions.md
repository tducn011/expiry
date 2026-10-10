# DOC-DECISIONS — Decision ledger and open questions

- Document ID: `DOC-DECISIONS`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Giữ quyết định đã ghi và chặn proposal khỏi tự trở thành approved.

## Evidence sources

- [00-context/source-register.md](source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| ID | Quyết định/phần còn mở | Status | Artifact ảnh hưởng |
|---|---|---|---|
| DEC-01 | Private inventory | User confirmed | Owner FK/API scope |
| DEC-02 | Manual + in-app attention | User confirmed | Không cần scan/worker/push tables ở MVP |
| DEC-03 | Food entry + movement ledger; remaining_quantity làm operational source of truth | Proposed | ERD, transaction, resolve API |
| DEC-04 | DATE riêng với TIMESTAMPTZ; uncertainty tách khỏi opening | Proposed | Dictionary, API |
| DEC-05 | Soft delete là quản trị bản ghi; không ghi discard | Proposed | History/trash/restore |
| DEC-06 | Warning lead mặc định 2 ngày chỉ là cấu hình thử nghiệm; user sửa 0–30 | Proposed, chưa validated | UX/priority/settings |
| DEC-07 | Modular monolith; feature modules và service/repo boundary | Proposed | Repo |
| DEC-08 | Auth provider/session strategy và stack | Open | Auth adapter, implementation; domain/API business có thể làm trước |
| DEC-09 | Read-before-sign-in: public demo + draft form, auth khi đọc kho riêng hoặc lưu | Proposed từ CTX-05 | UX auth continuation |
| DEC-10 | Rich text Canva đã đọc trực tiếp; image/layout chưa inspect | Source retrieved | Persona fidelity; raw interview validation còn mở |
| DEC-11 | Deployment, backend runtime, hosting, vận hành DB | Open | Chưa triển khai infra |

Không có blocker cho bộ logical design này. Trước khi gọi ERD/API là final: review DEC-03…09 và thử các task với người thuộc ba cơ chế. Không yêu cầu user gửi lại quyết định DEC-01/02 hoặc chốt stack giả.

### Current open questions

| ID | Topic | Question / conflict | Review owner role | Effect |
|---|---|---|---|---|
| OQ-01 | Scope provenance | GR2 legacy OCR/push/multidomain vs design manual/private | Product/SE reviewer | Keep manual MVP; legacy targets unapproved |
| OQ-02 | Data contracts | Review grain, units, certainty and FE DTO mappings | BE/DB/FE reviewers | Production implementation gated |
| OQ-03 | Stack/ORM | Choose Node/Express versions, SQL engine and ORM after transaction spike | BE/DB | Prisma/Sequelize/PostgreSQL remain candidates |
| OQ-04 | Auth | Provider vs local passwords, session store and host topology | BE/security reviewer | Hybrid JWT not selected |
| OQ-05 | OCR evidence | Food-image benchmark, retention, latency/correction value | Research/Python | No Python production service |
| OQ-06 | Figma/TMB | TMB source found/installed; provide exact Figma design URL/key if visual parity needed | UX owner | Provisional observed LAYOUT |
| OQ-07 | User validation | Interview provenance, task completion/time/staleness baseline | HCI | No usability/outcome approval |
| OQ-08 | Sensors | Does sensors bắt lỗi mean error tracking, device sensors or both? | Product owner | App error tracking plan only; hardware sensors not included |
| OQ-09 | Deployment | Host/process limits, SQL/session persistence, secrets/backup owner | Ops/BE | Topology proposal; no deploy |

ADR records are Review/Blocked, never Approved merely because a Markdown validator passes.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [adr/README.md](../adr/README.md)
- [00-context/audit.md](audit.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [adr/README.md](../adr/README.md)
- [00-context/audit.md](audit.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
