import { resolveAssetUrl } from '@/api/client'
import { Icon, type IconName } from '@/components/ui/Icon'
import './course.css'

const PALETTE: { grad: string; icon: IconName }[] = [
  { grad: 'linear-gradient(135deg, #0B2E52 0%, #1E5F96 55%, #3D9BD8 100%)', icon: 'bulb' },
  { grad: 'linear-gradient(135deg, #1E5F96 0%, #3D9BD8 55%, #7CD3FF 100%)', icon: 'list' },
  { grad: 'linear-gradient(135deg, #E8A33D 0%, #F2BC5E 55%, #F7CF7E 100%)', icon: 'message' },
  { grad: 'linear-gradient(135deg, #3B2F7A 0%, #6B55C9 55%, #9C8BEA 100%)', icon: 'sparkle' },
]

/** Stable pick from the palette so a course always gets the same cover colors. */
function coverTheme(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

interface Props {
  seed: string
  word: string
  tag?: string | null
  badge?: string | null
  image?: string | null
  height?: number
  wordSize?: number
}

export function CourseCover({ seed, word, tag, badge, image, height = 230, wordSize = 28 }: Props) {
  const theme = coverTheme(seed)
  const src = resolveAssetUrl(image)

  return (
    <div className="ccover" style={{ height, background: theme.grad }}>
      {src ? (
        <img className="ccover-img cover-photo" src={src} alt="" loading="lazy" />
      ) : (
        <>
          <div className="dots ccover-dots" aria-hidden="true" />
          <div className="ccover-glow" aria-hidden="true" />
          <div className="spin-slow ccover-ring" aria-hidden="true" />
          <span className="ccover-ghost" aria-hidden="true">
            {word}
          </span>
          <img
            className="cover-photo ccover-photo"
            src="/assets/brand/saleh-cutout.webp"
            alt=""
            loading="lazy"
          />
          <div className="ccover-title">
            <span className="cover-icon glass ccover-icon">
              <Icon name={theme.icon} size={22} />
            </span>
            <span style={{ fontSize: wordSize }}>{word}</span>
          </div>
        </>
      )}
      {tag && <span className="glass ccover-tag">{tag}</span>}
      {badge && <span className="ccover-badge">{badge}</span>}
    </div>
  )
}
