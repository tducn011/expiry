import type { FoodEntry } from "../mockApi"
import { fmtQty, fmtTime, unitLabel } from "../lib/format"
import Grid from "../components/layout/Grid"
import PageHeader from "../components/layout/PageHeader"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import EmptyState from "../components/ui/EmptyState"

export default function Trash({
  foods,
  onRestore,
}: {
  foods: FoodEntry[]
  onRestore: (f: FoodEntry) => void
}) {
  return (
    <Grid className="page">
      <PageHeader
        eyebrow="ĐÃ XÓA"
        title="Thùng rác"
        description="Có thể khôi phục lại món đã xóa về kho."
      />
      <div className="col-span-full lg:col-span-8">
        {foods.length ? (
          <Card>
            <div className="row-list">
              {foods.map((f) => (
                <div className="trash-row" key={f.id}>
                  <div>
                    <strong>{f.name}</strong>
                    <span>
                      {fmtQty(f.remaining_quantity)} {unitLabel[f.unit]}
                      {f.deleted_at && ` · Xóa lúc ${fmtTime(f.deleted_at)}`}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon="check"
                    onClick={() => onRestore(f)}
                  >
                    Khôi phục
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <EmptyState
            eyebrow="TRỐNG"
            title="Thùng rác trống"
            body="Chưa có món nào bị xóa."
          />
        )}
      </div>
    </Grid>
  )
}
