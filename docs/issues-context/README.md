# Master Issues Portfolio & Context Directory

- **Last Updated**: 2026-10-19
- **Status**: **Active Engineering Portfolio**
- **Framework**: Every Sub-issue enforces `INPUT -> PROBLEM STATEMENT -> OUTPUT -> FINAL CONTRACT -> VERIFICATION`.

---

## 1. Master Issue Landscape

| Issue | Name & Focus Area | Target Branch | Status | Primary Capability |
| :---: | :--- | :---: | :---: | :--- |
| [**i1**](./i1/i1.md) | **Connect API & Web** | `develop` | **IN PROGRESS** | Connect React frontend to Node.js backend & MySQL auth/cookies. |
| [**i2**](./i2/i2.md) | **Barcode Support & Vision Date Extraction** | `develop` | **READY TO CLAIM** | Multi-format barcode scanning, MySQL migration 003, and Vision LLM fallback. |
| [**i3**](./i3/i3.md) | **Background Expiry Alert Dispatcher & Web Push** | `develop` | **READY TO CLAIM** | Proactive midnight expiry worker (`node-cron`) & VAPID Web Push notifications. |
| [**i4**](./i4/i4.md) | **Offline-First Mutation Queue & Reconnection Sync** | `develop` | **READY TO CLAIM** | IndexedDB offline store and optimistic mutation queue for zero-network environments. |
| [**i5**](./i5/i5.md) | **Open Food Facts Catalog & Metadata Enrichment** | `develop` | **READY TO CLAIM** | Auto-lookup food title, brand, image, and estimated shelf-life from barcode scans. |

---

## 2. Claiming & Execution Workflow

To claim an open sub-issue:
1. Navigate to the relevant sub-issue document (e.g., [`i2a.md`](./i2/i2a.md) or [`i3a.md`](./i3/i3a.md)).
2. Update the header:
   ```markdown
   - **Assignee**: @your-handle
   - **Status**: CLAIMED
   ```
3. Create your feature branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/<issue-id>-<slug>
   ```
4. Implement the changes following the specified **INPUT**, **OUTPUT**, and **FINAL CONTRACT**.
5. Execute the verification commands before opening a Pull Request into `develop`.
