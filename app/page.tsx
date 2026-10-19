"use client";
import { useRef, useState } from 'react';
import { ArrowRight, Armchair, Check, CircleHelp, Coffee, Headphones, LoaderCircle, Plane, RotateCcw, Star, Users, Wallet, Luggage, Wifi } from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';

const services = [
  { name: 'Seat comfort', detail: 'Your seat, space and legroom', icon: Armchair },
  { name: 'Cabin crew', detail: 'Friendliness and service on board', icon: Users },
  { name: 'Food & drinks', detail: 'The meals and refreshments', icon: Coffee },
  { name: 'Entertainment', detail: 'Movies, music and things to enjoy', icon: Headphones },
  { name: 'Ground service', detail: 'Your check-in and boarding experience', icon: Luggage },
  { name: 'Value for money', detail: 'The experience for the fare you paid', icon: Wallet },
  { name: 'Wi-Fi & connectivity', detail: 'The internet connection on board', icon: Wifi },
];
const scale = ['Poor', 'Fair', 'Okay', 'Good', 'Excellent'];
type Rating = number | 'na' | null;
type Prediction = { recommendation: 'Yes' | 'No' };
const emptyRatings = (): Rating[] => [null, null, null, null, null, null, 'na'];

export default function Home() {
  const [ratings, setRatings] = useState<Rating[]>(emptyRatings);
  const [result, setResult] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const resultRef = useRef<HTMLElement>(null);
  const requestSequence = useRef(0);
  const ratedCount = ratings.filter(v => typeof v === 'number').length;

  function update(next: Rating[]) {
    requestSequence.current += 1;
    setRatings(next); setResult(null); setError(''); setLoading(false);
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (ratings.some(v => v === null)) { setError('Please choose a score or “Not rated” for each service.'); return; }
    if (!ratedCount) { setError('Please rate at least one service.'); return; }
    const current = ++requestSequence.current;
    setLoading(true); setError(''); setResult(null);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratings: ratings.map(v => v === 'na' ? null : v) }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json() as Prediction & { error?: string };
      if (!response.ok) throw new Error(data.error || 'We couldn’t complete your result. Please try again.');
      if (current !== requestSequence.current) return;
      setResult(data);
      setTimeout(() => {
        if (current !== requestSequence.current) return;
        resultRef.current?.focus({ preventScroll: true });
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    } catch (err) {
      if (current === requestSequence.current) setError(err instanceof TypeError ? 'We couldn’t connect. Please try again.' : err instanceof Error && err.name !== 'TimeoutError' ? err.message : 'This is taking longer than expected. Please try again.');
    } finally { if (current === requestSequence.current) setLoading(false); }
  }
  const positive = result?.recommendation === 'Yes';
  return <><Header /><main id="main-content">
    <section className="intro"><div className="intro-kicker"><span /> THE JOURNEY, THROUGH YOUR EYES <span /></div><h1>How was your <span>flight?</span></h1><p>A little feedback on every part of your journey.</p><div className="flight-trail" aria-hidden="true"><i /><Plane size={23} /><i /></div></section>
    <section className="survey" aria-labelledby="survey-title"><div className="survey-top"><div><h2 id="survey-title">Rate your experience</h2><p>Choose 1–5. Select “Not rated” for anything you didn’t use.</p></div><span className="count" aria-live="polite"><Star size={14} /> {ratedCount} rated</span></div>
      <form onSubmit={submit} noValidate>
        <div className="column-key" aria-hidden="true"><span>YOUR EXPERIENCE</span><div>{scale.map((name, i) => <span key={name}>{i + 1}<small>{name}</small></span>)}</div><span /></div>
        <div className="rating-list">{services.map((service, index) => <fieldset key={service.name} className={`rating-row ${typeof ratings[index] === 'number' ? 'rated' : ''}`}>
          <legend className="sr-only">{service.name}</legend><div className="service"><span className="service-icon"><service.icon size={21} strokeWidth={1.7} /></span><div><h3 aria-hidden="true">{service.name}{index === 6 && <small>Optional</small>}</h3><p>{service.detail}</p></div></div>
          <div className="choices">{[1, 2, 3, 4, 5].map(value => <label key={value} className={`choice ${typeof ratings[index] === 'number' && value <= (ratings[index] as number) ? 'lit' : ''}`} title={`${value} — ${scale[value - 1]}`}><input type="radio" name={`rating-${index}`} value={value} checked={ratings[index] === value} onChange={() => update(ratings.map((v, i) => i === index ? value : v))} aria-label={`${service.name}: ${value}, ${scale[value - 1]}`} /><span><Star size={21} /><b>{value}</b></span></label>)}</div>
          <label className="not-rated"><input type="radio" name={`rating-${index}`} value="na" checked={ratings[index] === 'na'} onChange={() => update(ratings.map((v, i) => i === index ? 'na' : v))} aria-label={`${service.name}: Not rated`} /><span>Not rated</span></label>
        </fieldset>)}</div>
        <div className="mobile-key">1 Poor <span>·</span> 2 Fair <span>·</span> 3 Okay <span>·</span> 4 Good <span>·</span> 5 Excellent</div>
        {error && <p className="form-error" role="alert"><CircleHelp size={17} /> {error}</p>}
        <div className="survey-actions"><button className="reset" type="button" disabled={loading || ratings.every((v, i) => v === emptyRatings()[i])} onClick={() => update(emptyRatings())}><RotateCcw size={15} /> Start over</button><button className="submit" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={18} /> One moment…</> : <>See my result <ArrowRight size={19} /></>}</button></div>
      </form>
    </section>
    {result && <section className={`result ${positive ? 'positive' : 'negative'}`} ref={resultRef} tabIndex={-1} aria-label="Your recommendation result" aria-live="polite"><div className="result-icon">{positive ? <Check size={26} /> : <CircleHelp size={26} />}</div><div><span className="result-label">YOUR RESULT</span><h2>{positive ? 'Likely to recommend' : 'Unlikely to recommend'}</h2><p>Your ratings suggest you {positive ? 'would' : 'would not'} recommend this airline.</p></div><span className="result-estimate">Based on your ratings</span></section>}
  </main><Footer /></>;
}
