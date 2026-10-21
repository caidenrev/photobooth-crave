"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getNavTransitionTypes } from "@/lib/navDirection";

type LinkProps = React.ComponentProps<typeof Link>;

/** next/link yang otomatis memberi arah slide page transition */
export default function TransitionLink({ href, transitionTypes, ...props }: LinkProps) {
  const pathname = usePathname();
  const target = typeof href === "string" ? href : href.pathname ?? pathname;

  return (
    <Link
      href={href}
      transitionTypes={transitionTypes ?? getNavTransitionTypes(pathname, target)}
      {...props}
    />
  );
}

type AppRouter = ReturnType<typeof useRouter>;
type NavigateOptions = Parameters<AppRouter["push"]>[1];

/** useRouter() dengan push/replace yang otomatis memberi arah slide page transition */
export function useTransitionRouter(): AppRouter {
  const router = useRouter();
  const pathname = usePathname();

  const withTypes = (href: string, options?: NavigateOptions): NavigateOptions => ({
    ...options,
    transitionTypes: options?.transitionTypes ?? getNavTransitionTypes(pathname, href),
  });

  return {
    ...router,
    push: (href, options) => router.push(href, withTypes(href, options)),
    replace: (href, options) => router.replace(href, withTypes(href, options)),
  };
}
