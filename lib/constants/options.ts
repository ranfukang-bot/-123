export const VIDEO_TYPES = [
  { value: 'Storytelling', label: '种草叙事 / 日常 Vlog' },
  { value: 'Product Showcase', label: '产品展示短片' },
  { value: 'Lifestyle Documentary', label: '生活方式纪录片' },
  { value: 'Fast-paced Montage', label: '快节奏卡点混剪' },
  { value: 'ASMR/Sensory', label: '感官展示 / ASMR' },
] as const

export const PLATFORMS = [
  { value: '抖音', label: '抖音' },
  { value: '小红书', label: '小红书' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'B站', label: 'B站' },
  { value: '快手', label: '快手' },
  { value: '视频号', label: '视频号' },
  { value: '其他', label: '其他' },
] as const

export const VIDEO_TYPE_VALUES = VIDEO_TYPES.map((type) => type.value)
export const PLATFORM_VALUES = PLATFORMS.map((platform) => platform.value)

export const VIDEO_TYPE_LABELS = Object.fromEntries(
  VIDEO_TYPES.map((type) => [type.value, type.label])
) as Record<(typeof VIDEO_TYPES)[number]['value'], string>
