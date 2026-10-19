import { Plane } from 'lucide-react';
export default function Header() {
  return <><a className="skip-link" href="#main-content">Skip to ratings</a><header className="header"><a href="/" className="brand" aria-label="Airframe home"><span><Plane size={23} /></span>airframe<span className="brand-dot">.</span></a><a href="#survey-title" className="header-link">Your flight experience <span>↗</span></a></header></>;
}
