import Link from "next/link";
import Image from "next/image";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="airbnb Inicio">
      <Image
        src="/belo.svg"
        alt=""
        width={32}
        height={32}
        className="shrink-0"
        priority
      />
      <span className="text-xl font-semibold tracking-tight text-[#FF5A5F] lowercase">
        airbnb
      </span>
    </Link>
  );
};

export default Logo;
