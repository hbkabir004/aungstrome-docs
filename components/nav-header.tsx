"use client"

import { memo, useMemo } from "react"
import { cn } from "@/lib/utils"
import { BookOpen, Home, Search, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
] as const

interface NavItemProps {
  href: string
  label: string
  icon: typeof Home
  isActive: boolean
}

const NavItem = memo(function NavItem({ href, label, icon: Icon, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
        "hover:bg-accent hover:text-accent-foreground",
        isActive
          ? "bg-primary/10 text-primary dark:bg-primary/20"
          : "text-muted-foreground"
      )}
    >
      <Icon className={cn("h-4 w-4 transition-transform", isActive && "scale-110")} />
      <span className="hidden sm:inline">{label}</span>
      {isActive && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary sm:hidden" />
      )}
    </Link>
  )
})

export const NavHeader = memo(function NavHeader() {
  const pathname = usePathname()

  const items = useMemo(() =>
    navItems.map(item => ({
      ...item,
      isActive: pathname === item.href ||
        (item.href !== "/" && pathname.startsWith(item.href))
    })),
    [pathname]
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl mx-auto items-center px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 mr-6 group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
            <BookOpen className="h-4.5 w-4.5 text-primary" />
          </div>
          <span className="hidden sm:block font-semibold text-foreground tracking-tight">
            Aungstrome
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-1 items-center gap-1">
          {items.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={item.isActive}
            />
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
})
