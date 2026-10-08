# [S8] Implementation order và [S9] Risks/verify

## S3.35 End-to-end traceability
| Trace | Persona/pain | Outcome/FR | Feature | Flow/scenario | UC | UI | Data | Route | Verification |
|---|---|---|---|---|---|---|---|---|---|
| TR-01 | P1 PP-11/13 | BR-V1-01 FR-01 | F-01 | UF-01 SC-01 | UC-01 | WF-02 | entry+initial movement+request | API-01 | Saved or rollback all |
| TR-02 | P1/P2 PP-22 | BR-V1-02 FR-01/03 | F-01/03 | UF-02 SC-02 | UC-01/03 | WF-02/03 | date nullable/source/certainty | API-01/03 | Unknown visible, no guessed date |
| TR-03 | P1 PP-11 | BR-V1-01 FR-02/03 | F-02 | UF-03 SC-03 | UC-02/03 | WF-01/03 | owner settings+entry read | API-02/03 | Correct reason, stable priority |
| TR-04 | P2 PP-21 | BR-V1-02 FR-03/04 | F-02/03/04 | UF-04 SC-04 | UC-03/04 | WF-01/03/04 | entry+movement | API-02/03/05 | User chooses next action; test decision gap |
| TR-05 | P3 PP-31/32 | BR-V1-03 FR-04 | F-04 | UF-05 SC-05/08/09 | UC-04 | WF-04 | quantity+consume+key | API-05 | Partial amount, replay, concurrent409 |
| TR-06 | All | BR-V1-03 FR-04 | F-04 | UF-06 SC-06/12 | UC-05 | WF-04 | discard movement, depleted | API-05 | Waste/use separate; no soft delete |
| TR-07 | P3 PP-31/33 | BR-V1-03 FR-06/07 | F-05/06 | UF-07 SC-07 | UC-07/08 | WF-04/05 | adjustment+reason+entry | API-06/07 | Ledger delta matches current quantity |
| TR-08 | P2/P3 PP-22/33 | BR-V1-02/03 FR-05 | F-05 | UF-08 SC-11 | UC-06 | WF-02 | metadata/version, no qty | API-04 | Conflict safe, merged data valid |
| TR-09 | P3 PP-33 | BR-V1-03 FR-08 | F-07 | UF-09 SC-10 | UC-09/10 | WF-03/05 | deleted_at/version, no movement | API-08/09/10 | Restore exact amount/history |
| TR-10 | All | BR-V1-01 FR-09 | F-08 | UF-10 SC-14 | UC-11 | WF-06 | user timezone/lead | API-11/12 | Calendar boundary, no food rewrite |
| TR-11 | All | FR-10 NFR-01/04 | Auth support | UF-11 SC-13 | UC-00 + owned UCs | WF-00/02/04 | principal identity | All owned routes | 401 draft retained, foreign404 |

## S8.1 Order: architecture → ownership → flow → modules → migration → code
| Gate | Work | Deliverable | Acceptance | Có thể chạy song song |
|---|---|---|---|---|
| G0 Context | Đối chiếu Canva/DEC-01/02, review assumptions | Context/decision ledger | Không thay persona; scope rõ | Research interviews chuẩn bị |
| G1 Domain backbone | Grain, data dictionary, date/unit/state/quantity rules | Rule spec + flow/scenario | Mỗi field/transition có reason/task | UX screen/task review |
| G2 Contract | Routes/DTO/errors/version/idempotency | OpenAPI+fixtures+traceability | FE/BE cùng contract | FE mock + BE domain |
| G3 Ownership/architecture | Chốt module ports/auth adapter/tx source | Repo skeleton + DI wiring | Không global god controller; owner from identity | FE components vs BE services |
| G4 Persistence | Chọn DB, physical schema/constraints/migrations | Migrations + integration DB | Create fresh DB; rollback integrity | BE repos; FE mocks tiếp tục |
| G5 Core tasks | Capture→review→movement/recount, history | Integrated three core functions | SC-01…09 pass | Chia theo features, không một người ôm mọi layer |
| G6 Support/recovery | Edit/trash/restore/preferences/auth continuation | Complete MVP flows | SC-10…15 pass | UX accessible/error views |
| G7 Review | Contract/security/concurrency/date/usability | Test report + decisions | Không gọi validated nếu chưa user study | Ba môn reuse cùng IDs |

## S8.2 Task decomposition cho 5 người, chưa tự gán tên
| Task | Scope | Output | Dependencies | Đồng đảm nhiệm/review |
|---|---|---|---|---|
| TASK-01 | Persona evidence và usability protocol | Questions/incidents/source ledger | G0 | HCI + SE reviewer |
| TASK-02 | Flows/use cases/wireframe | Screen action/spec states | G1 | UX + FE |
| TASK-03 | Data model/rules/ERD | Dictionary/cardinality/migration plan | G1 | SE + BE + DB reviewer |
| TASK-04 | Contract/BE services/repos | Routes/DTO/tx/integration tests | G2/G3/G4 | BE owners theo use case |
| TASK-05 | FE feature components/mock/integration | UI tasks + error recovery | G2 | FE + UX + BE contract reviewer |

Nhiều người có thể cùng task với primary owner/reviewer; người tự claim theo quy trình user. Chưa thêm deadlines hoặc tên vào assignment khi không được cung cấp.

## S9.1 Verification matrix
| Test | Setup/action | Expected | Layer |
|---|---|---|---|
| VT-01 | Create known/unknown date | Shape đúng, initial event, unknown visible | Contract+DB |
| VT-02 | Create rollback trước movement/request result | Không orphan entry hoặc reserved key commit | Integration |
| VT-03 | Consume 250g từ 1000g | 750g; delta -250; version+1 | Domain+DB |
| VT-04 | Consume quá lượng/negative/piece fractional | 409 hoặc422; không write | Domain+contract |
| VT-05 | Hai requests cùng version | 1 success, 1 conflict; quantity>=0 | Real concurrent DB |
| VT-06 | Same key+payload concurrent/retry | 1 mutation/event; original result replay | Real concurrent DB |
| VT-07 | Same key different target/body | 409 key reuse | Integration |
| VT-08 | Recount to same amount | 200 no-op; no movement/version increment | Domain+DB |
| VT-09 | Recount depleted to positive | Active derived, adjustment reason | Domain+DB |
| VT-10 | Consume then discard remainder | Depleted; totals distinguish use/waste | Ledger audit |
| VT-11 | Soft delete then restore | Amount/history unchanged, visibility restored | Integration+UI |
| VT-12 | GET/PATCH/action/history foreign ID | 404, no exposure | Auth regression |
| VT-13 | Clock around UTC/local midnight | Correct today/soon/past_date | Injected clock tests |
| VT-14 | Metadata patch date→null malformed combination | 422; no partial invalid certainty | Contract+domain |
| VT-15 | Timeout/401/409 UI | Draft and stable key; refetch conflict | UI task tests |
| VT-16 | Migration fresh + backup restore | Constraints/data recovered | Staging |
| VT-17 | Keyboard/labels/no color-only | Task usable | UX/accessibility |

## S9.2 Material limitations/risk register
- Exact Canva text đã đọc qua connector trong lượt tiếp tục; tên/quotes dùng nguyên nội dung nguồn, sửa spelling chỉ khi authoring mới. Persona vẫn proto-persona; việc đọc slide không chứng minh đã interview thật.
- P2 decision gap còn rộng hơn MVP attention list; recipes/action guidance cần research, không tự tạo AI recommendations.
- Private inventory không giải quyết multi-member coordination đầy đủ; scope đã user chọn.
- Date/opening/freezing không đủ xác định safety. Không tự derive duration hoặc safe label.
- Quantity fractional/unit/split behavior là proposed. Mixed opening batch cần tách capture ban đầu; automatic split/transfer deferred.
- Stack/auth/deploy chưa chốt; logical design đủ FE mock/domain work, chưa deployment specification.
- No database runtime/app hiện có ở workspace để verify SQL transactions end-to-end. Tài liệu/test matrix không phải tests đã pass.
- Diagram sources valid by review; tool rendering validation trạng thái ghi trong delivery notes, không gọi rendered nếu chưa chạy.

## S9.3 Definition of Ready và Done
Ready for implementation: approved grain/owner/date/state, OpenAPI coherent, representative mock fixtures, tx boundary và auth adapter quyết định đủ để coding.
Done for MVP: integrated task paths, contract/owner/concurrency/date tests thực chạy, usability findings ghi rõ, migration/backup readiness và demo review. Bộ tài liệu hôm nay là **design draft hoàn chỉnh để review**, không tuyên bố app đã hoàn thành.
