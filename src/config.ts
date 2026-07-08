/** 游戏正式公网地址(结局卡二维码等宣传物料使用) */
export const SITE_URL = 'https://beijing-dating-adventure.pages.dev'

/** 分享用链接:线上环境用当前域名(换域名自动跟随),本地开发/局域网环境回退到正式地址 */
export function shareUrl(): string {
  const h = location.hostname
  const isLocal =
    h === 'localhost' || h.startsWith('127.') || h.startsWith('192.168.') || h.startsWith('10.')
  return isLocal ? SITE_URL : location.origin
}
