'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

export default function ThemeToggle({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const options = [
    { value: 'light', label: 'สว่าง', icon: <Sun size={16} /> },
    { value: 'dark', label: 'มืด', icon: <Moon size={16} /> },
    { value: 'system', label: 'อัตโนมัติ', icon: <Monitor size={16} /> },
  ];

  const cycleTheme = () => {
    const idx = options.findIndex((o) => o.value === theme);
    const next = options[(idx + 1) % options.length];
    setTheme(next.value);
  };

  const current = options.find((o) => o.value === theme) ?? options[2];

  return (
    <button
      onClick={cycleTheme}
      className={`nav-item text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 w-full ${collapsed ? 'justify-center px-2' : ''}`}
      title={collapsed ? `ธีม: ${current.label}` : undefined}
    >
      <span className='flex-shrink-0'>{current.icon}</span>
      {!collapsed && <span className='text-sm'>ธีม: {current.label}</span>}
    </button>
  );
}
