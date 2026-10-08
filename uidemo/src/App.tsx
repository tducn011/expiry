import { useMemo, useState } from "react";
import { ApiError, attentionFor, mockApi } from "./mockApi";
import type { Attention, CreatePayload, FoodEntry, QuantityMovement } from "./mockApi";
import Shell, { View } from "./components/layout/Shell";
import Icon from "./components/ui/Icon";
import Detail, { DetailAction } from "./features/Detail";
import EntryForm from "./features/EntryForm";
import History from "./features/History";
import Inventory, { defaultFilters, InventoryFilters } from "./features/Inventory";
import MovementForm from "./features/MovementForm";
import Settings from "./features/Settings";
import StatusDialog, { Dialog, StatusMode } from "./features/StatusDialog";
import Trash from "./features/Trash";
import Welcome from "./features/Welcome";
import Home from "./features/Home";
import Reviews, { ReviewTab } from "./features/Reviews";

type ModalKind = "add" | "restore" | DetailAction | StatusMode | null;
const statusModes: StatusMode[] = [
  "conflict",
  "timeout",
  "loading",
  "read",
  "notfound",
  "rate",
  "session",
  "insufficient",
];

function App() {
  const queryParams = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const [started, setStarted] = useState(() => queryParams.has("demo") || queryParams.has("started"));
  const [authenticated, setAuthenticated] = useState(() => queryParams.has("demo"));
  const [authPending, setAuthPending] = useState(false);
  const [view, setView] = useState<View>(() => {
    const v = queryParams.get("view") as View;
    return v && ["home", "inventory", "attention", "reviews", "trash", "settings"].includes(v) ? v : "home";
  });
  const [reviewsTab, setReviewsTab] = useState<ReviewTab>(() => {
    const t = queryParams.get("tab") as ReviewTab;
    return t && ["triage", "zones", "insights"].includes(t) ? t : "triage";
  });
  const [revision, setRevision] = useState(0);
  const [filters, setFilters] = useState<InventoryFilters>(defaultFilters);
  const [selectedId, setSelectedId] = useState<string | null>(() => queryParams.get("id"));
  const [modal, setModal] = useState<ModalKind>(() => {
    const m = queryParams.get("modal") as ModalKind;
    return m ? m : null;
  });
  const [notice, setNotice] = useState("");
  const [pendingCreate, setPendingCreate] = useState<CreatePayload | null>(null);

  // Query snapshot re-read from the API boundary after every confirmed mutation (cache invalidation seam).
  const entries = useMemo(() => mockApi.listEntries(), [revision]);
  const trash = useMemo(() => mockApi.listTrash(), [revision]);
  const prefs = useMemo(() => mockApi.getPreferences(), [revision]);
  const selected = useMemo(
    () => (selectedId ? mockApi.getEntry(selectedId) : null),
    [selectedId, revision]
  );
  const attention = (e: FoodEntry) => attentionFor(e, prefs.attention_lead_days);

  const counts = useMemo(() => {
    const c: Record<Attention, number> = { past: 0, today: 0, soon: 0, unknown: 0, later: 0 };
    entries.forEach((e) => {
      if (e.remaining_quantity > 0) c[attention(e)] += 1;
    });
    return c;
  }, [entries, prefs]);

  const allMovements = useMemo(() => {
    const list: QuantityMovement[] = [];
    entries.forEach((e) => {
      const entryMovements = mockApi.listMovements(e.id);
      list.push(...entryMovements);
    });
    return list;
  }, [entries, revision]);

  const recentActivities = useMemo(() => {
    const activities: { movement: QuantityMovement; food: FoodEntry }[] = [];
    entries.forEach((e) => {
      const entryMovements = mockApi.listMovements(e.id);
      entryMovements.forEach((m) => {
        activities.push({ movement: m, food: e });
      });
    });
    return activities.sort((a, b) => b.movement.recorded_at.localeCompare(a.movement.recorded_at));
  }, [entries, revision]);

  const visible = useMemo(
    () =>
      entries.filter((f) => {
        if (view === "attention" && (attention(f) === "later" || f.remaining_quantity === 0))
          return false;
        if (filters.query && !f.name.toLowerCase().includes(filters.query.toLowerCase()))
          return false;
        if (filters.location !== "Tất cả vị trí" && f.storage_location !== filters.location)
          return false;
        if (view !== "attention" && filters.lifecycle === "Còn hàng" && f.remaining_quantity === 0)
          return false;
        if (view !== "attention" && filters.lifecycle === "Đã hết" && f.remaining_quantity > 0)
          return false;
        return true;
      }),
    [entries, view, filters, prefs]
  );

  const commit = (run: () => unknown, message: string) => {
    try {
      run();
    } catch (error) {
      if (error instanceof ApiError)
        setModal(
          error.code === "VERSION_CONFLICT"
            ? "conflict"
            : error.code === "INSUFFICIENT_QUANTITY"
            ? "insufficient"
            : error.status === 404
            ? "notfound"
            : "read"
        );
      return false;
    }
    setRevision((r) => r + 1);
    setModal(null);
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
    return true;
  };

  const create = (payload: CreatePayload) => {
    if (!authenticated) {
      setPendingCreate(payload);
      setModal(null);
      setAuthPending(true);
      return;
    }
    let id = "";
    if (
      commit(() => {
        id = mockApi.createEntry(
          mockApi.createCommandKey("create-food-entry"),
          payload
        ).data.id;
      }, "Đã thêm thực phẩm và ghi lịch sử ban đầu")
    ) {
      setSelectedId(id);
    }
  };

  const quickFreeze = (food: FoodEntry) => {
    const key = mockApi.createCommandKey("freeze");
    const note = food.note ? `${food.note} · Cấp đông ngày 08/10` : "Cấp đông ngày 08/10";
    commit(
      () =>
        mockApi.updateEntry(key, food.id, food.version, {
          name: food.name,
          storage_location: "Ngăn đông",
          expiry_date: food.expiry_date,
          expiry_date_certainty: food.expiry_date_certainty,
          expiry_date_source: food.expiry_date_source,
          expiry_date_label_type: food.expiry_date_label_type,
          opened_on: food.opened_on,
          note,
        }),
      `Đã chuyển “${food.name}” vào Ngăn đông`
    );
  };

  const quickConsume = (food: FoodEntry, amount = food.remaining_quantity, reason = "Đã dùng hết") => {
    const key = mockApi.createCommandKey("consume");
    commit(
      () => mockApi.recordMovement(key, food.id, food.version, "consume", amount, reason),
      `Đã ghi nhận dùng hết “${food.name}”`
    );
  };

  const quickDiscard = (food: FoodEntry, amount = food.remaining_quantity, reason = "Đã bỏ") => {
    const key = mockApi.createCommandKey("discard");
    commit(
      () => mockApi.recordMovement(key, food.id, food.version, "discard", amount, reason),
      `Đã ghi nhận bỏ “${food.name}”`
    );
  };

  const quickRecount = (food: FoodEntry, amount: number, reason: string) => {
    const key = mockApi.createCommandKey("recount");
    commit(
      () => mockApi.recount(key, food.id, food.version, amount, reason),
      `Đã cập nhật lượng “${food.name}” thành ${amount}`
    );
  };

  if (!started)
    return (
      <Welcome
        onStart={() => {
          setStarted(true);
          setModal("add");
        }}
        onDemo={() => {
          setStarted(true);
          setAuthenticated(true);
        }}
      />
    );

  const displayName = mockApi.user.display_name || "Bạn";
  const navigate = (v: View, locationFilter?: string) => {
    setView(v);
    setSelectedId(null);
    if (locationFilter) {
      setFilters((prev) => ({ ...prev, location: locationFilter }));
    }
  };

  const urgentCount = counts.past + counts.today + counts.soon;

  return (
    <Shell
      view={view}
      setView={navigate}
      onAdd={() => setModal("add")}
      displayName={displayName}
      attentionCount={counts.past + counts.today + counts.soon + counts.unknown}
      urgentReviewCount={urgentCount}
    >
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" />
          {notice}
        </div>
      )}

      {selected && !selected.deleted_at ? (
        <Detail
          food={selected}
          attention={attention(selected)}
          movements={mockApi.listMovements(selected.id)}
          onBack={() => setSelectedId(null)}
          onAction={setModal}
        />
      ) : view === "home" ? (
        <Home
          displayName={displayName}
          foods={entries}
          counts={counts}
          attention={attention}
          onOpen={(f) => setSelectedId(f.id)}
          onAdd={() => setModal("add")}
          onNavigate={(targetView, location) => navigate(targetView, location)}
          onStartReview={(tab) => {
            if (tab) setReviewsTab(tab);
            setView("reviews");
          }}
          recentActivities={recentActivities}
          onQuickConsume={(f) => quickConsume(f)}
          onQuickFreeze={(f) => quickFreeze(f)}
        />
      ) : view === "reviews" ? (
        <Reviews
          initialTab={reviewsTab}
          foods={entries}
          attention={attention}
          movements={allMovements}
          onOpen={(f) => setSelectedId(f.id)}
          onConsume={(f, amount, reason) => quickConsume(f, amount, reason)}
          onDiscard={(f, amount, reason) => quickDiscard(f, amount, reason)}
          onFreeze={(f) => quickFreeze(f)}
          onRecount={(f, amount, reason) => quickRecount(f, amount, reason)}
          onAdd={() => setModal("add")}
        />
      ) : view === "settings" ? (
        <Settings
          prefs={prefs}
          displayName={displayName}
          onSave={(patch) =>
            commit(
              () =>
                mockApi.updatePreferences(
                  mockApi.createCommandKey("preferences"),
                  prefs.version,
                  patch
                ),
              "Đã lưu cài đặt và tính lại danh sách cần chú ý"
            )
          }
          onRecovery={setModal}
        />
      ) : view === "trash" ? (
        <Trash
          foods={trash}
          onRestore={(f) => {
            setSelectedId(f.id);
            setModal("restore");
          }}
        />
      ) : (
        <Inventory
          mode={view === "attention" ? "attention" : "inventory"}
          foods={visible}
          counts={counts}
          leadDays={prefs.attention_lead_days}
          attention={attention}
          filters={filters}
          setFilters={setFilters}
          onOpen={(f) => setSelectedId(f.id)}
          onAdd={() => setModal("add")}
          onShowAttention={() => navigate("attention")}
        />
      )}

      {modal === "add" && (
        <EntryForm
          initial={pendingCreate}
          onClose={() => setModal(null)}
          onCreate={create}
        />
      )}
      {authPending && (
        <Dialog
          eyebrow="TIẾP TỤC TASK CỦA BẠN"
          title="Đăng nhập để lưu"
          body="Bản nháp vẫn được giữ nguyên. Sau khi đăng nhập, bạn quay lại đúng bước đang làm. Đây là điểm tích hợp xác thực mô phỏng."
          extra={
            <p className="note-box">
              <Icon name="check" />
              <span>Dữ liệu kho được tách riêng theo từng tài khoản.</span>
            </p>
          }
          action="Tiếp tục với tài khoản demo"
          cancel={false}
          dismissible={false}
          onClose={() => {}}
          onAction={() => {
            setAuthenticated(true);
            setAuthPending(false);
            if (pendingCreate) {
              create(pendingCreate);
              setPendingCreate(null);
            }
          }}
        />
      )}
      {selected && (modal === "consume" || modal === "discard" || modal === "recount") && (
        <MovementForm
          food={selected}
          mode={modal}
          onClose={() => setModal(null)}
          onSave={(amount, why) => {
            const key = mockApi.createCommandKey(modal);
            commit(
              () =>
                modal === "recount"
                  ? mockApi.recount(key, selected.id, selected.version, amount, why)
                  : mockApi.recordMovement(
                      key,
                      selected.id,
                      selected.version,
                      modal,
                      amount,
                      why || null
                    ),
              modal === "recount"
                ? "Đã cập nhật lượng sau kiểm lại"
                : `Đã ghi nhận ${modal === "consume" ? "đã dùng" : "đã bỏ"}`
            );
          }}
        />
      )}
      {selected && modal === "history" && (
        <History
          food={selected}
          movements={mockApi.listMovements(selected.id)}
          onClose={() => setModal(null)}
        />
      )}
      {selected && modal === "edit" && (
        <EntryForm
          entry={selected}
          onClose={() => setModal(null)}
          onUpdate={(patch) =>
            commit(
              () =>
                mockApi.updateEntry(
                  mockApi.createCommandKey("update"),
                  selected.id,
                  selected.version,
                  patch
                ),
              "Đã cập nhật thông tin và tính lại mức cần chú ý"
            )
          }
        />
      )}
      {selected && modal === "delete" && (
        <Dialog
          eyebrow="XÓA BẢN GHI"
          title={`Xóa “${selected.name}”?`}
          body="Thao tác này không ghi nhận đã dùng hoặc đã bỏ. Bạn có thể khôi phục từ thùng rác."
          action="Xóa bản ghi"
          actionVariant="danger"
          onClose={() => setModal(null)}
          onAction={() => {
            if (
              commit(
                () =>
                  mockApi.deleteEntry(
                    mockApi.createCommandKey("delete"),
                    selected.id,
                    selected.version
                  ),
                "Đã chuyển bản ghi vào thùng rác"
              )
            )
              setSelectedId(null);
          }}
        />
      )}
      {selected && modal === "restore" && (
        <Dialog
          eyebrow="KHÔI PHỤC"
          title={`Khôi phục “${selected.name}”?`}
          body="Món trở lại kho với nguyên lượng và lịch sử. Trạng thái cần chú ý sẽ được tính lại."
          action="Khôi phục"
          onClose={() => {
            setModal(null);
            setSelectedId(null);
          }}
          onAction={() => {
            if (
              commit(
                () =>
                  mockApi.restoreEntry(
                    mockApi.createCommandKey("restore"),
                    selected.id
                  ),
                "Đã khôi phục bản ghi"
              )
            )
              navigate("inventory");
          }}
        />
      )}
      {statusModes.includes(modal as StatusMode) && (
        <StatusDialog mode={modal as StatusMode} onClose={() => setModal(null)} />
      )}
    </Shell>
  );
}

export default App;
