export default function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-mark ${className}`.trim()} aria-hidden="true">
      <span className="brand-mark__rings" />
      <span className="brand-mark__center" />
    </span>
  );
}
