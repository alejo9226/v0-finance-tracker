import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative">
          {/* Top bar */}
          <div className="bg-background border-b flex h-16 items-center justify-between fixed left-0 top-0 z-50 w-full px-4 md:px-6">
            <div className="flex items-center gap-2 font-bold text-xl">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">F</div>
              FinanceTrack
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/test-supabase">
                <Button variant="outline" size="sm">Test Supabase</Button>
              </Link>
              <Link href="/admin/create-user">
                <Button variant="outline" size="sm">Admin</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>

            {/* Mobile nav toggle and menu */}
            <details className="md:hidden relative">
              <summary className="list-none p-2 cursor-pointer flex items-center select-none">
                <span className="sr-only">Toggle navigation</span>
                <Menu className="block group-open:hidden" size={24} />
                <X className="hidden group-open:block" size={24} />
              </summary>
              <div className="border-b flex flex-col items-start gap-2 p-6 bg-background fixed right-0 top-16 z-50 w-screen">
                <Link href="/test-supabase" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">Test Supabase</Button>
                </Link>
                <Link href="/admin/create-user" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">Admin</Button>
                </Link>
                <Link href="/login" className="w-full">
                  <Button variant="ghost" className="w-full">Login</Button>
                </Link>
                <Link href="/signup" className="w-full">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
