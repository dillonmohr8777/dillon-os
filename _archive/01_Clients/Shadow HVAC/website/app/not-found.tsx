import Link from "next/link";
import { Home, Phone } from "lucide-react";
import { business } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="container-px grid min-h-[80svh] place-items-center py-32 text-center">
      <div>
        <p className="heading text-8xl text-gradient-heat sm:text-9xl">404</p>
        <h1 className="heading mt-4 text-2xl text-white sm:text-3xl">
          This play didn't connect
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-400">
          The page you're looking for isn't on the field. Let's get you back to comfort.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-ember">
            <Home className="h-4 w-4" /> Back Home
          </Link>
          <a href={business.phoneHref} className="btn-ghost">
            <Phone className="h-4 w-4" /> Call {business.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
