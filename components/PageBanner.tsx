import Link from 'next/link';

type Props = { title: string; crumb?: string };

export default function PageBanner({ title, crumb }: Props) {
  return (
    <section className="page-banner">
      <div className="container">
        <h1>{title}</h1>
        <div className="breadcrumb">
          <Link href="/">Home</Link> &raquo; {crumb ?? title}
        </div>
      </div>
    </section>
  );
}
