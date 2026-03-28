'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Scissors,
  BarChart3,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  CreditCard,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'หน้าหลัก',
    icon: <LayoutDashboard size={22} />,
  },
  {
    href: '/inventory',
    label: 'สินค้าและสต็อก',
    icon: <Package size={22} />,
    roles: ['admin', 'manager'],
  },
  {
    href: '/pos',
    label: 'ขายสินค้า (POS)',
    icon: <ShoppingCart size={22} />,
    roles: ['admin', 'manager', 'cashier'],
  },
  {
    href: '/job-orders',
    label: 'งานปักเสื้อ',
    icon: <Scissors size={22} />,
  },
  {
    href: '/installments',
    label: 'ผ่อนชำระ',
    icon: <CreditCard size={22} />,
    roles: ['admin', 'manager', 'cashier'],
  },
  {
    href: '/risk-dashboard',
    label: 'แดชบอร์ดความเสี่ยง',
    icon: <BarChart3 size={22} />,
    roles: ['admin', 'manager'],
  },
  {
    href: '/customers',
    label: 'ลูกค้า',
    icon: <Users size={22} />,
    roles: ['admin', 'manager'],
  },
  {
    href: '/reports',
    label: 'รายงาน',
    icon: <FileText size={22} />,
    roles: ['admin', 'manager'],
  },
  {
    href: '/sales',
    label: 'ประวัติการขาย',
    icon: <ShoppingCart size={18} />,
    roles: ['admin', 'manager', 'cashier'],
  },
  {
    href: '/settings',
    label: 'ตั้งค่า',
    icon: <Settings size={22} />,
    roles: ['admin'],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, loading, signOut, hasRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storeLogo, setStoreLogo] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'store_logo_url')
      .maybeSingle()
      .then(({ data }) => setStoreLogo(data?.value ?? null));
  }, []);

  // hasRole already falls back to cached localStorage role, so no need to check loading
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return hasRole(item.roles);
  });

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const roleLabels: Record<string, string> = {
    admin: 'ผู้ดูแลระบบ',
    manager: 'ผู้จัดการ',
    cashier: 'แคชเชียร์',
    embroidery_staff: 'ช่างปัก',
  };

  return (
    <>
      {/* Sidebar — desktop only (mobile uses BottomNav) */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm z-40
          transition-all duration-300 flex-col
          ${collapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Header */}
        <div
          className={`p-4 border-b border-gray-100 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}
        >
          {!collapsed && (
            <div className='flex items-center gap-2'>
              {storeLogo ? (
                <img
                  src={storeLogo}
                  alt='โลโก้ร้าน'
                  className='w-8 h-8 rounded-lg object-contain'
                />
              ) : null}
              <div>
                <h1 className='text-xl font-bold text-brand-600'>LookKuan</h1>
                <p className='text-xs text-gray-400'>ระบบจัดการร้าน</p>
              </div>
            </div>
          )}
          {collapsed &&
            (storeLogo ? (
              <img
                src={storeLogo}
                alt='โลโก้ร้าน'
                className='w-9 h-9 rounded-lg object-contain'
              />
            ) : (
              <span className='text-xl font-bold text-brand-600'>LK</span>
            ))}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className='hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-400'
            aria-label={collapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className='flex-1 p-3 space-y-1 overflow-y-auto'>
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item.href) ? 'nav-item-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className='flex-shrink-0'>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className='p-3 border-t border-gray-100'>
          {!collapsed && profile && (
            <div className='px-3 py-2 mb-2'>
              <p className='font-semibold text-gray-800 text-sm truncate'>
                {profile.full_name}
              </p>
              <p className='text-xs text-gray-500'>
                {roleLabels[profile.role] || profile.role}
              </p>
            </div>
          )}
          <button
            onClick={signOut}
            className={`nav-item text-red-600 hover:bg-red-50 hover:text-red-700 w-full ${collapsed ? 'justify-center px-2' : ''}`}
            title='ออกจากระบบ'
          >
            <LogOut size={22} />
            {!collapsed && <span>ออกจากระบบ</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
