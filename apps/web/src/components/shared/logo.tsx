import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-1.5" aria-label="StayHub Inicio">
      <span className="text-xl font-bold tracking-tight text-[#FF385C]">StayHub</span>
    </Link>
  );
};

export default Logo;
