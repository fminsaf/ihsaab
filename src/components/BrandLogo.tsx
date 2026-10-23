import logo from "../assets/logo.svg";

export function BrandLogo({ className = "" }: { className?: string }) {
  return <img src={logo} alt="" aria-hidden="true" className={`block shrink-0 dark:invert ${className}`} />;
}
