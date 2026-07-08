import { ReactNode } from 'react'

/** 手机壳容器:移动端全屏,桌面端居中显示带边框的手机 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="phone-shell">
      <div className="phone-frame">
        <div className="frame-inner">{children}</div>
      </div>
    </div>
  )
}
