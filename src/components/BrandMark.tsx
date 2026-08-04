export default function BrandMark({ className = "" }: { className?: string }) {
  return (
    <img
      className={`brand-mark ${className}`.trim()}
      src="/atlantis-mark.svg"
      width="64"
      height="64"
      alt=""
      aria-hidden="true"
    />
  );
}
