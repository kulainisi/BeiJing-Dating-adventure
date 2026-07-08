/** 游戏正式公网地址(稳定域名,始终指向最新部署;结局卡二维码/宣传物料使用) */
export const SITE_URL = 'https://beijing-dating-adventure.pages.dev'

/** 正式域名主机名(不带哈希前缀) */
const PROD_HOST = 'beijing-dating-adventure.pages.dev'

/** 版本号,附在分享链接上破除浏览器缓存,保证扫码总是加载最新版 */
export const APP_VERSION = '2'

/**
 * 分享/二维码链接:永远指向稳定正式域名。
 * - 本地开发、局域网调试 → 回退到正式地址
 * - Cloudflare 单次部署的预览子域名(<哈希>.…pages.dev,会冻结在旧版本)→ 纠正回正式域名
 * - 正式域名 / 未来自定义域名 → 用当前域名
 */
export function shareUrl(): string {
  const h = location.hostname
  const isLocal =
    h === 'localhost' || h.startsWith('127.') || h.startsWith('192.168.') || h.startsWith('10.')
  const isPreview = h.endsWith('.pages.dev') && h !== PROD_HOST
  const base = isLocal || isPreview ? SITE_URL : location.origin
  return `${base}?v=${APP_VERSION}`
}
