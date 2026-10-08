import { useState, useMemo } from "react";
import type { Attention, FoodEntry, QuantityMovement, Unit } from "../mockApi";
import { fmtDate, fmtQty, fmtTime, locations, movementLabel, unitLabel } from "../lib/format";
import Grid from "../components/layout/Grid";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Icon from "../components/ui/Icon";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import ProgressBar from "../components/ui/ProgressBar";
import Segmented from "../components/ui/Segmented";

export type ReviewTab = "triage" | "zones" | "insights";

export default function Reviews({
  initialTab = "triage",
  foods,
  attention,
  movements,
  onOpen,
  onConsume,
  onDiscard,
  onFreeze,
  onRecount,
  onAdd,
}: {
  initialTab?: ReviewTab;
  foods: FoodEntry[];
  attention: (f: FoodEntry) => Attention;
  movements: QuantityMovement[];
  onOpen: (f: FoodEntry) => void;
  onConsume: (food: FoodEntry, amount: number, reason?: string) => void;
  onDiscard: (food: FoodEntry, amount: number, reason?: string) => void;
  onFreeze: (food: FoodEntry) => void;
  onRecount: (food: FoodEntry, amount: number, reason: string) => void;
  onAdd: () => void;
}) {
  const [tab, setTab] = useState<ReviewTab>(initialTab);
  const [selectedZone, setSelectedZone] = useState<string>("Ngăn mát");
  const [auditedItemIds, setAuditedItemIds] = useState<Set<string>>(new Set());
  const [triageDoneIds, setTriageDoneIds] = useState<Set<string>>(new Set());

  // Filter foods for triage: past, today, soon (active stock)
  const activeFoods = useMemo(() => foods.filter((f) => f.remaining_quantity > 0), [foods]);

  const triageFoods = useMemo(() => {
    return activeFoods
      .filter((f) => {
        const att = attention(f);
        return att === "past" || att === "today" || att === "soon";
      })
      .sort((a, b) => {
        const priority = (f: FoodEntry) => {
          const att = attention(f);
          return att === "past" ? 3 : att === "today" ? 2 : 1;
        };
        return priority(b) - priority(a);
      });
  }, [activeFoods, attention]);

  // Zone foods
  const zoneFoods = useMemo(() => {
    return activeFoods.filter((f) => (f.storage_location || "Khác") === selectedZone);
  }, [activeFoods, selectedZone]);

  // Insights analytics derived from all movements and inventory
  const analytics = useMemo(() => {
    let consumedCount = 0;
    let discardedCount = 0;
    let recountCount = 0;

    movements.forEach((m) => {
      if (m.kind === "consume") consumedCount += 1;
      else if (m.kind === "discard") discardedCount += 1;
      else if (m.kind === "recount") recountCount += 1;
    });

    const totalDecisions = consumedCount + discardedCount;
    const saveRate = totalDecisions > 0 ? Math.round((consumedCount / totalDecisions) * 100) : 100;

    return {
      consumedCount,
      discardedCount,
      recountCount,
      saveRate,
      totalDecisions,
    };
  }, [movements]);

  // Smart recipes derived from expiring items
  const mealSuggestions = useMemo(() => {
    const urgentNames = triageFoods.map((f) => f.name.toLowerCase());
    const allNames = activeFoods.map((f) => f.name.toLowerCase());

    const hasItem = (keyword: string) =>
      allNames.some((n) => n.includes(keyword.toLowerCase()));

    const list = [];

    if (hasItem("cải") || hasItem("rau")) {
      list.push({
        title: "Canh rau cải thanh đạm",
        desc: "Dùng hết lượng rau cải trước khi héo. Kết hợp với thịt băm hoặc tôm khô.",
        items: ["Rau cải", "Hành hoa", "Gia vị"],
        difficulty: "Dễ · 15 phút",
        icon: "sparkles",
      });
    }

    if (hasItem("cá hồi") || hasItem("cá")) {
      list.push({
        title: "Cá hồi áp chảo sốt bơ chanh",
        desc: "Cá hồi tươi nên dùng ngay hoặc áp chảo nhanh để giữ trọn vị béo thơm.",
        items: ["Cá hồi phi lê", "Bơ lạt", "Chanh tươi"],
        difficulty: "Trung bình · 20 phút",
        icon: "zap",
      });
    }

    if (hasItem("sữa") || hasItem("sữa chua") || hasItem("chuối")) {
      list.push({
        title: "Sinh tố chuối & sữa chua dinh dưỡng",
        desc: "Cách nhanh nhất để tiêu thụ sữa và chuối chín, chống lãng phí bữa xế.",
        items: ["Sữa tươi", "Sữa chua Hy Lạp", "Chuối chín"],
        difficulty: "Siêu dễ · 5 phút",
        icon: "sparkles",
      });
    }

    if (hasItem("đậu hũ") || hasItem("trứng")) {
      list.push({
        title: "Trứng chiên đậu hũ non",
        desc: "Món ngon mềm béo, nguyên liệu tươi dùng trong ngày để đảm bảo độ ngọt.",
        items: ["Đậu hũ non", "Trứng gà", "Hành lá"],
        difficulty: "Dễ · 10 phút",
        icon: "check",
      });
    }

    // Default fallback meal if none match
    if (list.length === 0) {
      list.push({
        title: "Cơm chiên thập cẩm dọn tủ",
        desc: "Tận dụng mọi nguyên liệu còn lại trong tủ lạnh để tạo nên bữa ăn phong phú.",
        items: ["Cơm nguội", "Trứng", "Rau củ các loại"],
        difficulty: "Dễ · 15 phút",
        icon: "sparkles",
      });
    }

    return list;
  }, [triageFoods, activeFoods]);

  const handleMarkAudited = (id: string) => {
    setAuditedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleMarkAllZoneAudited = () => {
    setAuditedItemIds((prev) => {
      const next = new Set(prev);
      zoneFoods.forEach((f) => next.add(f.id));
      return next;
    });
  };

  return (
    <Grid className="page reviews-page">
      <PageHeader
        eyebrow="TÍNH NĂNG KIỂM KÊ & ĐỒNG BỘ THỰC PHẨM"
        title="Kiểm kê & Đánh giá"
        description="3 công cụ thông minh giúp bạn đồng bộ kho thực tế, xử lý nhanh món sắp hết hạn và giảm tối đa lãng phí thực phẩm."
        action={
          <Button icon="plus" onClick={onAdd}>
            Thêm thực phẩm
          </Button>
        }
      />

      {/* Feature Selector Tabs */}
      <div className="col-span-full review-tabs-container">
        <div className="review-tabs-bar">
          <button
            type="button"
            className={`review-tab-btn ${tab === "triage" ? "active" : ""}`}
            onClick={() => setTab("triage")}
          >
            <Icon name="zap" />
            <span>1. Kiểm tra khẩn cấp</span>
            {triageFoods.length > 0 && <span className="tab-badge">{triageFoods.length}</span>}
          </button>

          <button
            type="button"
            className={`review-tab-btn ${tab === "zones" ? "active" : ""}`}
            onClick={() => setTab("zones")}
          >
            <Icon name="review" />
            <span>2. Kiểm kê theo khu vực</span>
          </button>

          <button
            type="button"
            className={`review-tab-btn ${tab === "insights" ? "active" : ""}`}
            onClick={() => setTab("insights")}
          >
            <Icon name="trend" />
            <span>3. Đánh giá & Lãng phí</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FEATURE 1: KIỂM TRA KHẨN CẤP (QUICK DAILY TRIAGE) */}
      {/* ========================================================= */}
      {tab === "triage" && (
        <div className="col-span-full grid-wrapper">
          <div className="col-span-full lg:col-span-8 stack">
            <Card
              title="Danh sách cần xử lý nhanh"
              action={
                <span className="triage-counter">
                  Còn lại: <strong>{triageFoods.length} món</strong>
                </span>
              }
            >
              <p className="section-instruction">
                Rà soát các món quá hạn hoặc sắp hết hạn. Với mỗi món, bạn có thể thực hiện <strong>1 chạm</strong> để
                cập nhật trạng thái ngay mà không mất thời gian nhập liệu.
              </p>

              {triageFoods.length === 0 ? (
                <EmptyState
                  eyebrow="ĐÃ HOÀN TẤT"
                  title="Không có món nào cần xử lý gấp!"
                  body="Tất cả thực phẩm trong kho của bạn đều đang an toàn và còn hạn dài."
                  action={
                    <Button variant="secondary" onClick={() => setTab("zones")}>
                      Chuyển sang kiểm kê theo khu vực
                    </Button>
                  }
                />
              ) : (
                <div className="triage-cards-list">
                  {triageFoods.map((f) => {
                    const att = attention(f);
                    const unit = unitLabel[f.unit];
                    const isDone = triageDoneIds.has(f.id);

                    return (
                      <div
                        key={f.id}
                        className={`triage-action-card tone-${att} ${isDone ? "is-reconciled" : ""}`}
                      >
                        <div className="triage-header">
                          <div className="triage-title-group" onClick={() => onOpen(f)}>
                            <Badge type={att} />
                            <strong>{f.name}</strong>
                          </div>
                          <span className="triage-location">{f.storage_location || "Chưa ghi vị trí"}</span>
                        </div>

                        <div className="triage-meta-row">
                          <div className="triage-qty">
                            <span>Lượng còn:</span>
                            <strong>
                              {fmtQty(f.remaining_quantity)} {unit}
                            </strong>
                          </div>
                          <div className="triage-date">
                            <span>Hạn dùng:</span>
                            <strong>{fmtDate(f.expiry_date) || "Chưa có ngày"}</strong>
                          </div>
                        </div>

                        {/* One-tap Action Buttons */}
                        <div className="triage-buttons-grid">
                          <button
                            type="button"
                            className="triage-btn consume-btn"
                            onClick={() => {
                              onConsume(f, f.remaining_quantity, "Kiểm tra khẩn cấp: Đã dùng hết");
                              setTriageDoneIds((prev) => new Set(prev).add(f.id));
                            }}
                          >
                            <Icon name="check" />
                            <span>Đã dùng hết</span>
                          </button>

                          {f.storage_location !== "Ngăn đông" && (
                            <button
                              type="button"
                              className="triage-btn freeze-btn"
                              title="Chuyển sang ngăn đông để bảo quản lâu hơn"
                              onClick={() => {
                                onFreeze(f);
                                setTriageDoneIds((prev) => new Set(prev).add(f.id));
                              }}
                            >
                              <Icon name="snowflake" />
                              <span>Cấp đông</span>
                            </button>
                          )}

                          <button
                            type="button"
                            className="triage-btn discard-btn"
                            onClick={() => {
                              onDiscard(f, f.remaining_quantity, "Kiểm tra khẩn cấp: Quá hạn bỏ");
                              setTriageDoneIds((prev) => new Set(prev).add(f.id));
                            }}
                          >
                            <Icon name="trash" />
                            <span>Đã bỏ</span>
                          </button>

                          <button
                            type="button"
                            className="triage-btn recount-btn"
                            onClick={() => onOpen(f)}
                          >
                            <Icon name="edit" />
                            <span>Chi tiết / Đổi</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <aside className="col-span-full lg:col-span-4 stack">
            <Card title="Quy tắc xử lý nhanh" tone="muted">
              <div className="triage-rules-guide">
                <div className="rule-item">
                  <span className="rule-bullet consume">
                    <Icon name="check" />
                  </span>
                  <div>
                    <strong>Đã dùng hết</strong>
                    <p>Ghi nhận đã tiêu thụ, lượng về 0 và lưu vào lịch sử thành công.</p>
                  </div>
                </div>

                <div className="rule-item">
                  <span className="rule-bullet freeze">
                    <Icon name="snowflake" />
                  </span>
                  <div>
                    <strong>Cấp đông (Ngăn đông)</strong>
                    <p>Chuyển vị trí sang ngăn đông và tự động cập nhật thêm ghi chú.</p>
                  </div>
                </div>

                <div className="rule-item">
                  <span className="rule-bullet discard">
                    <Icon name="trash" />
                  </span>
                  <div>
                    <strong>Đã bỏ</strong>
                    <p>Ghi nhận thực phẩm đã hỏng, giúp hệ thống tính tỉ lệ hao phí.</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card tone="default">
              <div className="triage-summary-banner">
                <Icon name="sparkles" />
                <div>
                  <strong>BR-04: Đồng bộ không áp lực</strong>
                  <p>
                    Kiểm tra nhanh mỗi sáng hoặc trước bữa tối giúp bạn không bao giờ bỏ sót thức ăn đã hỏng.
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      )}

      {/* ========================================================= */}
      {/* FEATURE 2: KIỂM KÊ THEO KHU VỰC (ZONE & SHELF AUDIT) */}
      {/* ========================================================= */}
      {tab === "zones" && (
        <div className="col-span-full grid-wrapper">
          <div className="col-span-full lg:col-span-8 stack">
            <Card>
              <div className="zone-picker-header">
                <div>
                  <span className="eyebrow">CHỌN KHU VỰC CẦN KIỂM KÊ</span>
                  <h2>{selectedZone}</h2>
                </div>
                <div className="zone-progress-badge">
                  {zoneFoods.filter((f) => auditedItemIds.has(f.id)).length} / {zoneFoods.length} đã khớp
                </div>
              </div>

              {/* Zone Selector Chips */}
              <div className="zone-chips-list">
                {locations.map((loc) => {
                  const count = activeFoods.filter((f) => f.storage_location === loc).length;
                  return (
                    <button
                      key={loc}
                      type="button"
                      className={`zone-chip-btn ${selectedZone === loc ? "active" : ""}`}
                      onClick={() => setSelectedZone(loc)}
                    >
                      <span>{loc}</span>
                      <small>({count})</small>
                    </button>
                  );
                })}
              </div>

              <div className="zone-audit-progress-bar">
                <ProgressBar
                  value={zoneFoods.filter((f) => auditedItemIds.has(f.id)).length}
                  max={Math.max(1, zoneFoods.length)}
                  label="Tiến độ kiểm kê khu vực"
                  tone="success"
                />
              </div>

              {/* Zone Checklist Items */}
              {zoneFoods.length === 0 ? (
                <EmptyState
                  eyebrow="KHU VỰC TRỐNG"
                  title={`Không có món nào trong ${selectedZone}`}
                  body="Thêm thực phẩm mới vào vị trí này để quản lý."
                  action={
                    <Button icon="plus" onClick={onAdd}>
                      Thêm vào {selectedZone}
                    </Button>
                  }
                />
              ) : (
                <div className="zone-checklist">
                  {zoneFoods.map((f) => {
                    const isChecked = auditedItemIds.has(f.id);
                    const unit = unitLabel[f.unit];
                    const att = attention(f);

                    return (
                      <div
                        key={f.id}
                        className={`zone-item-row ${isChecked ? "checked" : ""}`}
                      >
                        <button
                          type="button"
                          className="zone-check-checkbox"
                          onClick={() => handleMarkAudited(f.id)}
                          aria-label={`Đánh dấu khớp cho ${f.name}`}
                        >
                          {isChecked && <Icon name="check" />}
                        </button>

                        <div className="zone-item-info" onClick={() => onOpen(f)}>
                          <div className="zone-item-title-row">
                            <strong>{f.name}</strong>
                            <Badge type={att} />
                          </div>
                          <span className="zone-item-date">
                            {f.expiry_date ? `HSD: ${fmtDate(f.expiry_date)}` : "Chưa có ngày"}
                          </span>
                        </div>

                        <div className="zone-item-controls">
                          <span className="zone-qty-display">
                            {fmtQty(f.remaining_quantity)} {unit}
                          </span>

                          <div className="zone-quick-math-btns">
                            <button
                              type="button"
                              className="math-btn"
                              title="Giảm 1"
                              disabled={f.remaining_quantity <= 1}
                              onClick={() => {
                                const newAmount = Math.max(0, f.remaining_quantity - 1);
                                onRecount(f, newAmount, "Kiểm kê khu vực: giảm 1");
                                handleMarkAudited(f.id);
                              }}
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              className="math-btn"
                              title="Tăng 1"
                              onClick={() => {
                                onRecount(f, f.remaining_quantity + 1, "Kiểm kê khu vực: tăng 1");
                                handleMarkAudited(f.id);
                              }}
                            >
                              +1
                            </button>
                            <button
                              type="button"
                              className="math-btn zero-btn"
                              title="Đã dùng hết (0)"
                              onClick={() => {
                                onConsume(f, f.remaining_quantity, "Kiểm kê khu vực: Đã dùng hết");
                                handleMarkAudited(f.id);
                              }}
                            >
                              Hết
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {zoneFoods.length > 0 && (
                <div className="zone-audit-footer-actions">
                  <Button variant="secondary" onClick={handleMarkAllZoneAudited}>
                    Đánh dấu tất cả đã khớp
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <aside className="col-span-full lg:col-span-4 stack">
            <Card title="Mẹo kiểm kê khu vực">
              <p className="rail-copy">
                Khi mở tủ kiểm tra, hãy so khớp số lượng thực tế với màn hình. Bạn có thể bấm <strong>-1</strong> hoặc{" "}
                <strong>Hết</strong> để cân bằng kho ngay lập tức.
              </p>
            </Card>

            <Card tone="muted">
              <div className="audit-benefits">
                <strong>Lợi ích kiểm kê định kỳ:</strong>
                <ul>
                  <li>Tránh mua trùng lặp những món vẫn còn trong tủ.</li>
                  <li>Phát hiện sớm món nằm khuất sau các chai lọ lớn.</li>
                  <li>Giữ dữ liệu app luôn chính xác với thực tế.</li>
                </ul>
              </div>
            </Card>
          </aside>
        </div>
      )}

      {/* ========================================================= */}
      {/* FEATURE 3: ĐÁNH GIÁ TIÊU DÙNG & LÃNG PHÍ (INSIGHTS) */}
      {/* ========================================================= */}
      {tab === "insights" && (
        <div className="col-span-full grid-wrapper">
          <div className="col-span-full lg:col-span-8 stack">
            {/* Efficiency Overview Card */}
            <Card title="Tổng kết tiêu dùng & Hiệu quả">
              <div className="insights-kpi-banner">
                <div className="kpi-score">
                  <strong>{analytics.saveRate}%</strong>
                  <span>Tỉ lệ dùng hết</span>
                </div>
                <div className="kpi-divider" />
                <div className="kpi-metrics-list">
                  <div className="kpi-item success">
                    <span>Đã tiêu thụ thành công:</span>
                    <strong>{analytics.consumedCount} lượt</strong>
                  </div>
                  <div className="kpi-item warning">
                    <span>Số lần phải vứt bỏ:</span>
                    <strong>{analytics.discardedCount} lượt</strong>
                  </div>
                  <div className="kpi-item neutral">
                    <span>Số lần kiểm chỉnh lại kho:</span>
                    <strong>{analytics.recountCount} lượt</strong>
                  </div>
                </div>
              </div>

              <div className="insights-progress-wrap">
                <ProgressBar
                  value={analytics.saveRate}
                  max={100}
                  label="Chỉ số bảo toàn thực phẩm gia đình"
                  tone={analytics.saveRate >= 70 ? "success" : "warning"}
                  valueText={`${analytics.saveRate}% bảo toàn`}
                />
              </div>
            </Card>

            {/* Smart Meal Recommendations (BR-05) */}
            <Card
              title="Gợi ý món ăn tận dụng nguyên liệu"
              action={<span className="suggestion-pill">Gợi ý thông minh</span>}
            >
              <p className="section-instruction">
                Dựa trên các món đang có trong tủ (ưu tiên các món sắp hết hạn), đây là các gợi ý chế biến nhanh để
                tránh lãng phí:
              </p>

              <div className="meal-suggestions-list">
                {mealSuggestions.map((meal, index) => (
                  <div key={index} className="meal-card">
                    <div className="meal-icon-wrap">
                      <Icon name={meal.icon} />
                    </div>
                    <div className="meal-content">
                      <div className="meal-header-row">
                        <strong>{meal.title}</strong>
                        <span className="meal-diff">{meal.difficulty}</span>
                      </div>
                      <p>{meal.desc}</p>
                      <div className="meal-ingredients-tags">
                        {meal.items.map((item, i) => (
                          <span key={i} className="ingredient-tag">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <aside className="col-span-full lg:col-span-4 stack">
            <Card title="Hành vi tiêu dùng (Research Insights)" tone="muted">
              <div className="research-insight-box">
                <Icon name="trend" />
                <div>
                  <strong>Tại sao thực phẩm bị lãng phí?</strong>
                  <p>
                    Nghiên cứu cho thấy <strong>80% lãng phí gia đình</strong> xuất phát từ việc thực phẩm bị khuất tầm
                    nhìn và không có kế hoạch nấu ăn kịp thời.
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="tips-list">
                <strong>Hành động tuần này:</strong>
                <ol>
                  <li>Ưu tiên dùng hết các món trong nhóm “Cần chú ý”.</li>
                  <li>Nếu chưa ăn kịp rau hoặc thịt cá, hãy dùng nút “Cấp đông”.</li>
                  <li>Kiểm kê nhanh mỗi 2–3 ngày một lần.</li>
                </ol>
              </div>
            </Card>
          </aside>
        </div>
      )}
    </Grid>
  );
}
