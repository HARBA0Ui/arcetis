import Image from "next/image";
import { cn } from "@/lib/utils";

export function ArcetisLogo({ className }: { className?: string }) {
  return (
    <>
      <Image
        src="/logo_light.png"
        alt="arcetis logo light"
        width={600}
        height={150}
        priority
        style={{ width: 'auto', height: '100%' }}
        className={cn("w-auto object-contain dark:hidden", className)}
      />
      <Image
        src="/logo_dark.png"
        alt="arcetis logo dark"
        width={600}
        height={150}
        priority
        style={{ width: 'auto', height: '100%' }}
        className={cn("hidden w-auto object-contain dark:block", className)}
      />
    </>
  );
}
