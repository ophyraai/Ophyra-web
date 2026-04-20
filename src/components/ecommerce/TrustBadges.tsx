import { Truck, ShieldCheck, Leaf, CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function TrustBadges() {
  const t = useTranslations('landing.footer.trust');

  const items = [
    { icon: Truck, title: t('shippingTitle'), desc: t('shippingDesc') },
    { icon: ShieldCheck, title: t('secureTitle'), desc: t('secureDesc') },
    { icon: CreditCard, title: t('paymentsTitle'), desc: t('paymentsDesc') },
    { icon: Leaf, title: t('madeTitle'), desc: t('madeDesc') },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ofira-card-border bg-ofira-card-border lg:grid-cols-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center gap-2 bg-white px-4 py-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-ofira-violet/10 text-ofira-violet">
              <Icon className="size-5" strokeWidth={1.5} />
            </div>
            <div className="text-sm font-semibold text-ofira-text">{title}</div>
            <div className="text-xs leading-relaxed text-ofira-text-secondary">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
