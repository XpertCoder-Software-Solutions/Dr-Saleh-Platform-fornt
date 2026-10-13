import type { IconName } from '@/components/ui/Icon'

// Contact details shown across the site (footer, contact page, CTAs).
// TODO(Amr): replace the bracketed placeholders and '#' links with the real ones.
export const CONTACT = {
  whatsapp: { label: '[رقم واتساب]', href: 'https://wa.me/' },
  phoneEgypt: { label: '[رقم الهاتف]', href: '#' },
  phoneIntl: { label: '[رقم دولي]', href: '#' },
  hours: { days: 'الأحد للخميس', time: 'من 10ص لـ 6م' },
  social: {
    facebook: '#',
    instagram: '#',
    youtube: '#',
    tiktok: '#',
  },
}

export const SOCIAL: { label: string; icon: IconName; href: string }[] = [
  { label: 'فيسبوك', icon: 'facebook', href: CONTACT.social.facebook },
  { label: 'إنستجرام', icon: 'instagram', href: CONTACT.social.instagram },
  { label: 'يوتيوب', icon: 'youtube', href: CONTACT.social.youtube },
  { label: 'تيك توك', icon: 'tiktok', href: CONTACT.social.tiktok },
]
