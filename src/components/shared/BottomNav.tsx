'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/shared/ThemeToggle';
import {
  LayoutDashboard,
  ShoppingCart,
  Scissors,
  Package,
  Menu,
  X,
  BarChart3,
  Users,
  FileText,
  Settings,
  LogOut,
  Truck,
  ClipboardList,
  BrainCircuit,
} from 'lucide-react';

const roleLabels: Record<string, string> = {
  admin: 'ผู้ดูแลระบบ',
  manager: 'ผู้จัดการ',
  cashier: 'แคชเชียร์',
  embroidery_staff: 'ช่างปัก',
};

export default function BottomNav() {
  const pathname = usePathname();
  const { profile, hasRole, signOut } = useAuth();
  const [showDrawer, setShowDrawer] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  // Primary tabs — always visible in bottom bar
  const primaryTabs = [
    {
      href: '/dashboard',
      icon: <LayoutDashboard size={22} />,
      label: 'หน้าหลัก',
    },
    {
      href: '/pos',
      icon: <ShoppingCart size={22} />,
      label: 'ขายสินค้า',
      roles: ['admin', 'manager', 'cashier'],
    },
    { href: '/job-orders', icon: <Scissors size={22} />, label: 'งานปัก' },
    {
      href: '/inventory',
      icon: <Package size={22} />,
      label: 'สต็อก',
      roles: ['admin', 'manager'],
    },
  ].filter((tab) => !tab.roles || hasRole(tab.roles));

  // Secondary items — shown in drawer
  const drawerItems = [
    {
      href: '/risk-dashboard',
      icon: <BarChart3 size={20} />,
      label: 'แดชบอร์ดความเสี่ยง',
      roles: ['admin', 'manager'],
    },
    {
      href: '/customers',
      icon: <Users size={20} />,
      label: 'ลูกค้า',
      roles: ['admin', 'manager'],
    },
    {
      href: '/reports',
      icon: <FileText size={20} />,
      label: 'รายงาน',
      roles: ['admin', 'manager'],
    },
    {
      href: '/inventory/reorder',
      icon: <BrainCircuit size={20} />,
      label: 'AI สั่งซื้อ',
      roles: ['admin', 'manager'],
    },
    {
      href: '/suppliers',
      icon: <Truck size={20} />,
      label: 'ซัพพลายเออร์',
      roles: ['admin', 'manager'],
    },
    {
      href: '/purchase-orders',
      icon: <ClipboardList size={20} />,
      label: 'ใบสั่งซื้อ',
      roles: ['admin', 'manager'],
    },
    {
      href: '/settings',
      icon: <Settings size={20} />,
      label: 'ตั้งค่า',
      roles: ['admin'],
    },
  ].filter((item) => !item.roles || hasRole(item.roles));

  return (
    <>
      {/* Drawer overlay */}
      {showDrawer && (
        <div
          className='fixed inset-0 bg-black/40 z-40 lg:hidden'
          onClick={() => setShowDrawer(false)}
        />
      )}

      {/* Slide-up drawer */}
      <div
        className={`
        fixed bottom-16 left-0 right-0 z-50 lg:hidden
        bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl border-t border-gray-200 dark:border-gray-800
        transition-transform duration-300
        ${showDrawer ? 'translate-y-0' : 'translate-y-full'}
      `}
      >
        {/* Drawer handle */}
        <div className='flex justify-center pt-3 pb-1'>
          <div className='w-10 h-1 bg-gray-300 rounded-full' />
        </div>

        {/* User info */}
        {profile && (
          <div className='px-5 py-3 border-b border-gray-100'>
            <p className='font-bold text-gray-800'>{profile.full_name}</p>
            <p className='text-sm text-gray-500'>
              {roleLabels[profile.role] || profile.role}
            </p>
          </div>
        )}

        {/* Drawer menu items */}
        <div className='p-3 space-y-1'>
          {drawerItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setShowDrawer(false)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className='text-gray-500'>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <ThemeToggle />
          <button
            onClick={signOut}
            className='flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium
                     text-red-600 hover:bg-red-50 dark:hover:bg-red-950 w-full transition-colors'
          >
            <LogOut size={20} />
            ออกจากระบบ
          </button>
        </div>
        <div className='h-2' />
      </div>

      {/* Bottom Navigation Bar */}
      <nav
        className='
        fixed bottom-0 left-0 right-0 z-40 lg:hidden
        bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-800 shadow-lg
        safe-area-pb
      '
      >
        <div className='flex items-stretch h-16'>
          {primaryTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                flex-1 flex flex-col items-center justify-center gap-0.5
                text-xs font-medium transition-colors min-h-[44px]
                ${
                  isActive(tab.href)
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <span
                className={
                  isActive(tab.href) ? 'text-brand-600' : 'text-gray-400'
                }
              >
                {tab.icon}
              </span>
              <span className='leading-none'>{tab.label}</span>
            </Link>
          ))}

          {/* More button */}
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className={`
              flex-1 flex flex-col items-center justify-center gap-0.5
              text-xs font-medium transition-colors min-h-[44px]
              ${showDrawer ? 'text-brand-600 bg-brand-50' : 'text-gray-500'}
            `}
          >
            <span className={showDrawer ? 'text-brand-600' : 'text-gray-400'}>
              {showDrawer ? <X size={22} /> : <Menu size={22} />}
            </span>
            <span className='leading-none'>เพิ่มเติม</span>
          </button>
        </div>
      </nav>
    </>
  );
}
