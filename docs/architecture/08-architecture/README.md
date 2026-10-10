# DOC-INDEX-ADR — Architecture Decision Records Index

- Document ID: `DOC-INDEX-ADR`
- Status: **Approved**
- Updated: 2026-10-10T18:00:00+07:00

## Purpose

Mục lục và trạng thái của các biên bản quyết định kiến trúc (Architecture Decision Records) cho hệ thống Expiry.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)
- [08-architecture/07_Architecture_Components_and_Alternatives.md](07_Architecture_Components_and_Alternatives.md)

## ADR Register

| ADR ID | Tiêu đề | Trạng thái | Quyết định cốt lõi |
| :--- | :--- | :--- | :--- |
| [ADR-001](ADR-001-modular-monolith.md) | Modular monolith with source-owned rules | **Approved** | Node.js backend theo mô hình Modular Monolith với 3 module: `inventory`, `expiry`, `scan`. |
| [ADR-002](ADR-002-storage-orm.md) | SQL engine and storage layer selection | **Approved** | Chọn **MySQL 8+ (InnoDB)** làm cơ sở dữ liệu duy nhất, quản lý ACID transaction và row locking. |
| [ADR-003](ADR-003-authentication.md) | Authentication strategy | **Review** | Chiến lược phiên và xác thực người dùng cho private inventory. |
| [ADR-004](ADR-004-ocr-boundary.md) | Python Scan Service and OCR Execution Boundary | **Approved** | Python FastAPI độc lập xử lý tiền xử lý ảnh và OCR/regex parser. Bỏ toàn bộ ML/DL/LLM. Không truy cập MySQL. |
| [ADR-005](ADR-005-observability.md) | Observability, logging and monitoring | **Review** | Tiêu chuẩn ghi log phi định danh (redacted) và chỉ số hiệu năng. |
| [ADR-006](ADR-006-hybrid-architecture.md) | Hybrid Architecture: Node.js + Python Scan + MySQL | **Approved** | Quyết định tổng thể: Monorepo + Node.js Modular Monolith + Python Scan Service + MySQL. Loại bỏ toàn bộ ML/DL, training, model evaluation và LLM. |

## Related documents

- [README.md](../README.md)
- [08-architecture/07_Architecture_Components_and_Alternatives.md](07_Architecture_Components_and_Alternatives.md)
- [08-architecture/components.md](components.md)
- [08-architecture/deployment.md](deployment.md)
