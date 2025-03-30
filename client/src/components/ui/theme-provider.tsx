import * as React from "react"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps as NextThemeProviderProps } from "next-themes"

export interface ThemeProviderProps extends Omit<NextThemeProviderProps, "attribute"> {
  children: React.ReactNode
  attribute?: "class" | "data-theme" | "class" | "data-theme"[]
}

export function ThemeProvider({ 
  children, 
  ...props 
}: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}