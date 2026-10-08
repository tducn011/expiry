import { useMemo, useState } from "react";
import { ApiError, attentionFor, mockApi } from "./mockApi";
import type { Attention, CreatePayload, FoodEntry } from "./mockApi";
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
    return v && ["inventory", "attention", "trash", "settings"].includes(v) ? v : "inventory";
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

  const urgentCount = counts.past + counts.today + counts.soon;

  const visible = useMemo(
    () =>
      entries.filter((f) => {
        if (view === "attention" && (attention(f) === "later" || f.remaining_quantity === 0))
          return false;
        if (
          view !== "attention" &&
          filters.attentionFilter &&
          filters.attentionFilter !== "all" &&
          attention(f) !== filters.attentionFilter
        )
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
      }, "Đã thêm thực phẩm vào kho")
    ) {
      setSelectedId(id);
    }
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
  const navigate = (v: View) => {
    setView(v);
    setSelectedId(null);
  };

  return (
    <Shell
      view={view}
      setView={navigate}
      onAdd={() => setModal("add")}
      displayName={displayName}
      urgentCount={urgentCount}
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
              "Đã lưu cài đặt"
            )
          }
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
          eyebrow="XÁC THỰC"
          title="Đăng nhập để lưu"
          body="Bản nháp được giữ nguyên. Sau khi đăng nhập, bạn tiếp tục ngay bước hiện tại."
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
              "Đã cập nhật thông tin"
            )
          }
        />
      )}
      {selected && modal === "delete" && (
        <Dialog
          eyebrow="XÓA MÓN"
          title={`Xóa “${selected.name}”?`}
          body="Món sẽ được chuyển vào thùng rác và có thể khôi phục bất cứ lúc nào."
          action="Xóa vào thùng rác"
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
                "Đã chuyển vào thùng rác"
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
          body="Món sẽ trở lại kho thực phẩm với đầy đủ thông tin ban đầu."
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
                "Đã khôi phục thực phẩm"
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
