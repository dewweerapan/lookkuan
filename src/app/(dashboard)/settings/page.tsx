'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/shared/PageHeader'
import Link from 'next/link'
import StoreLogoSettings from '@/components/settings/StoreLogoSettings'
import DataExportSettings from '@/components/settings/DataExportSettings'

export default function SettingsPage() {
  const { profile, hasRole } = useAuth()
  const [stats, setStats] = useState({ users: 0, products: 0, categories: 0 })

  useEffect(() => {
    const loadStats = async () => {
      const client = createClient()
      const [
        { count: users },
        { count: products },
        { count: categories },
      ] = await Promise.all([
        client.from('profiles').select('*', { count: 'exact', head: true }),
        client.from('products').select('*', { count: 'exact', head: true }),
        client.from('categories').select('*', { count: 'exact', head: true }),
      ])
      setStats({ users: users || 0, products: products || 0, categories: categories || 0 })
    }
    loadStats()
  }, [])

  if (!hasRole('admin')) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🔒</p>
        <h2 className="text-xl font-bold text-gray-700">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-gray-500 mt-2">เฉพาะผู้ดูแลระบบเท่านั้น</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="ตั้งค่า" description="จัดการระบบร้าน LookKuan" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <p className="text-sm text-gray-500">ผู้ใช้งานทั้งหมด</p>
          <p className="text-2xl font-bold text-gray-800">{stats.users} คน</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">สินค้าทั้งหมด</p>
          <p className="text-2xl font-bold text-gray-800">{stats.products} รายการ</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">หมวดหมู่</p>
          <p className="text-2xl font-bold text-gray-800">{stats.categories} หมวด</p>
        </div>
      </div>

      <div className="mb-6">
        <StoreLogoSettings />
      </div>

      <div className="mb-6">
        <DataExportSettings />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/settings/users" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="text-lg font-bold text-gray-800">จัดการผู้ใช้งาน</h3>
          <p className="text-gray-500 mt-1">เพิ่ม ลบ แก้ไขข้อมูลพนักงาน กำหนดสิทธิ์การใช้งาน</p>
        </Link>
        <Link href="/inventory/categories" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl mb-3">📁</div>
          <h3 className="text-lg font-bold text-gray-800">จัดการหมวดหมู่สินค้า</h3>
          <p className="text-gray-500 mt-1">เพิ่ม แก้ไข ลบหมวดหมู่สินค้า</p>
        </Link>
      </div>
    </div>
  )
}
