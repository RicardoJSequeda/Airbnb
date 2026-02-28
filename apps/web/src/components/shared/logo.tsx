import Link from "next/link";
import Image from "next/image";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-0.01" aria-label="airbnb Inicio">
      <Image
        src="/icons/logo.png"
        alt="airbnb"
        width={56}
        height={56}
        className="shrink-0 object-contain w-14 h-14"
        priority
      />
      <span className="text-lg font-semibold tracking-tight text-[#FF5A5F] lowercase">
        airbnb
      </span>
    </Link>
  );
};

export default Logo;
