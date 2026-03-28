'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '@/components/shared/ImageUpload';
import { toast } from 'sonner';
import { STORE_LOGO_URL_KEY } from '@/lib/constants';

export default function StoreLogoSettings() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', STORE_LOGO_URL_KEY)
        .maybeSingle();
      setLogoUrl(data?.value ?? null);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async (url: string | null) => {
    setLogoUrl(url);
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase
        .from('store_settings')
        .upsert({
          key: STORE_LOGO_URL_KEY,
          value: url,
          updated_at: new Date().toISOString(),
        });
      toast.success('บันทึกโลโก้ร้านสำเร็จ');
    } catch {
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className='h-40 bg-gray-100 rounded-xl animate-pulse' />;

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6'>
      <h3 className='text-lg font-bold text-gray-800 mb-1'>โลโก้ร้าน</h3>
      <p className='text-sm text-gray-500 mb-4'>
        แสดงในระบบและเอกสารต่าง ๆ (แนะนำ: PNG 192×192)
      </p>
      <div className='flex items-start gap-6'>
        <ImageUpload
          value={logoUrl}
          onChange={handleSave}
          bucket='store-assets'
          folder='logo'
        />
        <div className='flex-1 pt-2'>
          {logoUrl ? (
            <div className='space-y-2'>
              <p className='text-sm font-medium text-green-700'>
                ✓ มีโลโก้ร้านแล้ว
              </p>
              <p className='text-xs text-gray-400 break-all'>{logoUrl}</p>
              <button
                onClick={() => handleSave(null)}
                disabled={saving}
                className='text-xs text-red-500 hover:text-red-700 underline'
              >
                ลบโลโก้
              </button>
            </div>
          ) : (
            <p className='text-sm text-gray-400'>
              ยังไม่ได้อัพโหลดโลโก้
              <br />
              คลิกที่กรอบด้านซ้ายเพื่ออัพโหลด
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
