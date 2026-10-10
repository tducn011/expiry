# DOC-ADR-001 — Modular monolith with source-owned rules

- Document ID: `DOC-ADR-001`
- Status: **Approved**
- Updated: 2026-10-10T18:00:00+07:00

## Purpose

Lựa chọn kiến trúc Modular Monolith cho tầng backend Node.js nhằm duy trì ranh giới nghiệp vụ rõ ràng, quản lý transaction ACID đơn giản và tránh phân mảnh phân tán.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)
- [08-architecture/07_Architecture_Components_and_Alternatives.md](07_Architecture_Components_and_Alternatives.md)
- [08-architecture/components.md](components.md)

## Definitions and assumptions

Team phát triển tập trung vào tính toàn vẹn dữ liệu của thực phẩm, số lượng và các mốc ngày hạn dùng. Cần tách module rõ ràng theo domain: `inventory`, `expiry`, `scan`.

## Analysis

| Khía cạnh | Quyết định & Phân tích |
| :--- | :--- |
| **Vấn đề** | Tránh sự phức tạp của microservices phân tán cho các tác vụ nghiệp vụ quản lý kho cá nhân. |
| **Phương án xem xét** | 1. Single deploy Modular Monolith trong Node.js (Chọn).<br/>2. Microservices tách biệt từng tính năng (Loại bỏ).<br/>3. MVC không phân tầng (Loại bỏ vì logic dễ trộn lẫn vào Controller). |
| **Bằng chứng** | Không có bằng chứng về tắc nghẽn lưu lượng (throughput bottleneck) hoặc nhu cầu đội ngũ độc lập đòi hỏi chia nhỏ microservices. Các tác vụ CRUD và audit ledger cần atomic transaction chung một database. |
| **Đánh đổi** | Đòi hỏi tính kỷ luật về boundary trong mã nguồn: các module giao tiếp qua domain services hoặc interfaces, không cross-import trực tiếp tầng persistence của module khác. |
| **Quyết định** | **Chấp thuận (Approved):** Xây dựng Node.js Modular Monolith với 3 module nghiệp vụ chính: `modules/inventory`, `modules/expiry`, `modules/scan`. |
| **Hệ quả** | Dễ triển khai, dễ test, 1 connection pool tới MySQL, quản lý transaction nguyên khối an toàn. |

## Decisions and rationale

[D] Phê duyệt Modular Monolith làm kiến trúc nền tảng của Node.js Backend. Node.js sở hữu logic nghiệp vụ, quản lý trạng thái phiên, tính toán AttentionPolicy và điều phối tương tác với cơ sở dữ liệu MySQL và service phụ trợ Python Scan.

## Dependencies

- [08-architecture/components.md](components.md)
- [08-architecture/07_Architecture_Components_and_Alternatives.md](07_Architecture_Components_and_Alternatives.md)
- [08-architecture/ADR-006-hybrid-architecture.md](ADR-006-hybrid-architecture.md)

## Related documents

- [README.md](../README.md)
- [08-architecture/components.md](components.md)
- [08-architecture/ADR-006-hybrid-architecture.md](ADR-006-hybrid-architecture.md)

## Verification criteria

- Mã nguồn backend chia rõ 3 thư mục `modules/inventory`, `modules/expiry`, `modules/scan`.
- Không có cross-boundary direct DB queries giữa các module.
