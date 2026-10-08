import type { FoodEntry } from "../mockApi";
import { fmtQty, fmtTime, unitLabel } from "../lib/format";
import Grid from "../components/layout/Grid";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";

/** UI-11 trash list. */
export default function Trash({ foods, onRestore }: { foods: FoodEntry[]; onRestore: (f: FoodEntry) => void }) {
  return <Grid className="page">
    <PageHeader eyebrow="CÓ THỂ KHÔI PHỤC" title="Thùng rác" description="Xóa bản ghi không thay đổi lượng hoặc lịch sử đã ghi." />
    <div className="col-span-full lg:col-span-8">
      {foods.length ? <Card><div className="row-list">{foods.map(f => <div className="trash-row" key={f.id}><div><strong>{f.name}</strong><span>{fmtQty(f.remaining_quantity)} {unitLabel[f.unit]} · Xóa lúc {f.deleted_at && fmtTime(f.deleted_at)}</span></div><Button variant="secondary" onClick={() => onRestore(f)}>Khôi phục</Button></div>)}</div></Card>
        : <EmptyState eyebrow="THÙNG RÁC TRỐNG" title="Không có bản ghi đã xóa" />}
    </div>
    <aside className="rail col-span-full lg:col-span-4"><Card tone="muted"><p className="rail-note"><span>Khôi phục đưa món về kho với nguyên lượng và toàn bộ lịch sử. Mức cần chú ý được tính lại theo cài đặt hiện tại.</span></p></Card></aside>
  </Grid>;
}
