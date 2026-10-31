import type { Dispatch, State } from "../store/appStore"

import { addDays, notifications, today } from "../store/appStore"

import Button from "../components/ui/Button"

import Card from "../components/ui/Card"

import EmptyState from "../components/ui/EmptyState"

import { BellOff } from "../components/ui/Icon"

import PageHeader from "../components/ui/PageHeader"

import StatusBadge, { Tag } from "../components/ui/StatusBadge"

export function Notifications({
  state,

  dispatch,

  onOpenDetail,

  onBack,

  notify,
}: {
  state: State

  dispatch: Dispatch

  onOpenDetail: (id: string) => void

  onBack?: () => void

  notify: (m: string) => void
}) {
  const list = notifications(state)

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <PageHeader
        title="Thông báo"
        subtitle="Nhắc nhở chủ động trong ứng dụng"
        onBack={onBack}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<BellOff size={32} />}
          title="Không có thông báo mới"
          text={
            state.settings.inApp
              ? "Bạn sẽ thấy lời nhắc tại đây khi có món sắp đến hạn hoặc đã qua HSD."
              : "Nhắc nhở trong ứng dụng hiện đang tắt trong phần Cài đặt."
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((n) => {
            const read = state.readNotifs.includes(n.id)

            return (
              <Card
                key={n.id}
                className={`flex flex-col gap-3 transition-opacity ${
                  read
                    ? "opacity-75 bg-bg-subtle/60"
                    : "border-brand-primary/30"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {!read && <Tag label="Mới" variant="brand" />}
                    <p className="text-base font-semibold text-text-primary truncate">
                      {n.food.name}
                    </p>
                  </div>
                  <StatusBadge
                    food={n.food}
                    remindDays={state.settings.remindDays}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-primary/40">
                  <Button
                    size="small"
                    variant="primary"
                    onClick={() => {
                      dispatch({ type: "readNotif", id: n.id })

                      onOpenDetail(n.food.id)
                    }}
                  >
                    Xem món
                  </Button>
                  {!read && (
                    <Button
                      size="small"
                      variant="neutral"
                      onClick={() => dispatch({ type: "readNotif", id: n.id })}
                    >
                      Đánh dấu đã đọc
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="subtle"
                    onClick={() => {
                      dispatch({
                        type: "snooze",

                        id: n.id,

                        until: addDays(today(), 1),
                      })

                      notify("Sẽ nhắc lại vào ngày mai")
                    }}
                  >
                    Nhắc lại sau
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Notifications
