'use client';

import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type Variant = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  stock_quantity: number;
  shelf_location: string;
  product: { id: string; name: string; base_price: number } | null;
};

export default function ShelfMapClient({
  variants: initialVariants,
}: {
  variants: Variant[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [localVariants, setLocalVariants] =
    useState<Variant[]>(initialVariants);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverShelf, setDragOverShelf] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Group by shelf_location
  const shelves = useMemo(() => {
    const map = new Map<string, Variant[]>();
    for (const v of localVariants) {
      const loc = v.shelf_location;
      if (!map.has(loc)) map.set(loc, []);
      map.get(loc)!.push(v);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [localVariants]);

  // Which shelves match the search
  const matchedShelves = useMemo(() => {
    if (!search.trim()) return new Set<string>();
    const q = search.toLowerCase();
    const matched = new Set<string>();
    for (const v of localVariants) {
      if (
        v.product?.name.toLowerCase().includes(q) ||
        v.sku?.toLowerCase().includes(q) ||
        v.shelf_location.toLowerCase().includes(q)
      ) {
        matched.add(v.shelf_location);
      }
    }
    return matched;
  }, [search, localVariants]);

  const isHighlighted = (loc: string) =>
    search.trim() ? matchedShelves.has(loc) : false;
  const isDimmed = (loc: string) =>
    search.trim() ? !matchedShelves.has(loc) : false;

  const selectedVariants = selected
    ? (shelves.find(([loc]) => loc === selected)?.[1] ?? [])
    : [];

  // Drag & drop handlers
  const handleDragStart = useCallback((variantId: string) => {
    setDraggingId(variantId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, shelfLoc: string) => {
    e.preventDefault();
    setDragOverShelf(shelfLoc);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverShelf(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetShelf: string) => {
      e.preventDefault();
      setDragOverShelf(null);
      if (!draggingId) return;

      const variant = localVariants.find((v) => v.id === draggingId);
      if (!variant || variant.shelf_location === targetShelf) {
        setDraggingId(null);
        return;
      }

      // Optimistic update
      const previousVariants = localVariants;
      setLocalVariants((prev) =>
        prev.map((v) =>
          v.id === draggingId ? { ...v, shelf_location: targetShelf } : v,
        ),
      );
      // Update selected panel to new shelf
      setSelected(targetShelf);
      setDraggingId(null);

      // Persist to DB
      setSaving(true);
      const supabase = createClient();
      const { error } = await supabase
        .from('product_variants')
        .update({ shelf_location: targetShelf })
        .eq('id', draggingId);

      setSaving(false);
      if (error) {
        setLocalVariants(previousVariants);
        toast.error('ไม่สามารถย้ายสินค้าได้');
      } else {
        toast.success(`ย้าย ${variant.sku} → ชั้น ${targetShelf} สำเร็จ`);
        router.refresh();
      }
    },
    [draggingId, localVariants, router],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverShelf(null);
  }, []);

  if (localVariants.length === 0) {
    return (
      <div className='mt-8 text-center py-16 bg-white rounded-xl border border-dashed border-gray-200'>
        <p className='text-4xl mb-3'>🗺️</p>
        <p className='text-gray-500'>ยังไม่มีสินค้าที่กำหนดตำแหน่งชั้นวาง</p>
        <p className='text-sm text-gray-400 mt-1'>
          แก้ไขสินค้าและกรอกช่อง &quot;ตำแหน่งชั้นวาง&quot; เช่น A1, B3
        </p>
      </div>
    );
  }

  return (
    <div className='mt-4 space-y-4'>
      {/* Toolbar */}
      <div className='flex items-center gap-3'>
        <div className='relative flex-1'>
          <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
            🔍
          </span>
          <input
            type='text'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelected(null);
            }}
            placeholder='ค้นหาชื่อสินค้า / SKU / ตำแหน่งชั้น'
            className='w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setEditMode((e) => !e);
            setDraggingId(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
            editMode
              ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
          }`}
        >
          ✏️ {editMode ? 'กำลังแก้ไข' : 'แก้ไขตำแหน่ง'}
        </button>
      </div>

      {editMode && (
        <div className='flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700'>
          <span>☝️</span>
          <span>
            ลากสินค้าในรายการขวามือไปวางที่ชั้นวางอื่นเพื่อย้ายตำแหน่ง
          </span>
          {saving && (
            <span className='ml-auto text-amber-600'>กำลังบันทึก...</span>
          )}
        </div>
      )}

      {search && matchedShelves.size > 0 && (
        <p className='text-sm text-brand-600 font-medium'>
          พบสินค้าใน {matchedShelves.size} ชั้นวาง:{' '}
          {Array.from(matchedShelves).join(', ')}
        </p>
      )}
      {search && matchedShelves.size === 0 && (
        <p className='text-sm text-gray-400'>ไม่พบสินค้าที่ตรงกัน</p>
      )}

      <div className='flex gap-6 items-start'>
        {/* Shelf Grid */}
        <div className='flex-1'>
          <p className='text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3'>
            แผนผังชั้นวาง ({shelves.length} ชั้น)
          </p>
          <div className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2'>
            {shelves.map(([loc, items]) => {
              const highlighted = isHighlighted(loc);
              const dimmed = isDimmed(loc);
              const isSelected = selected === loc;
              const isDragTarget = dragOverShelf === loc && draggingId !== null;
              const totalStock = items.reduce(
                (s, v) => s + v.stock_quantity,
                0,
              );
              const lowStock = items.some((v) => v.stock_quantity <= 3);

              return (
                <button
                  key={loc}
                  onClick={() => setSelected(isSelected ? null : loc)}
                  onDragOver={
                    editMode ? (e) => handleDragOver(e, loc) : undefined
                  }
                  onDragLeave={editMode ? handleDragLeave : undefined}
                  onDrop={editMode ? (e) => handleDrop(e, loc) : undefined}
                  className={`
                    relative flex flex-col items-center justify-center
                    rounded-xl border-2 p-3 h-20 transition-all text-center
                    ${isSelected ? 'border-brand-500 bg-brand-50 shadow-md' : ''}
                    ${isDragTarget ? 'border-green-400 bg-green-50 scale-105 shadow-lg' : ''}
                    ${highlighted && !isSelected && !isDragTarget ? 'border-yellow-400 bg-yellow-50 shadow-md scale-105' : ''}
                    ${dimmed ? 'opacity-30' : ''}
                    ${
                      !isSelected && !highlighted && !dimmed && !isDragTarget
                        ? 'border-gray-200 bg-white hover:border-brand-300 hover:bg-brand-50/50'
                        : ''
                    }
                  `}
                >
                  <span className='text-lg font-bold text-gray-700'>{loc}</span>
                  <span className='text-xs text-gray-400'>
                    {items.length} SKU
                  </span>
                  {lowStock && (
                    <span
                      className='absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full'
                      title='สต็อกใกล้หมด'
                    />
                  )}
                  <span
                    className={`text-xs font-medium mt-0.5 ${totalStock === 0 ? 'text-red-500' : 'text-gray-500'}`}
                  >
                    {totalStock} ชิ้น
                  </span>
                  {isDragTarget && (
                    <span className='absolute inset-0 flex items-center justify-center text-green-600 text-xl font-bold pointer-events-none'>
                      +
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className='flex flex-wrap gap-4 mt-4 text-xs text-gray-400'>
            <span className='flex items-center gap-1'>
              <span className='w-2 h-2 bg-red-400 rounded-full inline-block' />{' '}
              สต็อกใกล้หมด (≤3)
            </span>
            {search && (
              <span className='flex items-center gap-1'>
                <span className='w-4 h-4 rounded border-2 border-yellow-400 bg-yellow-50 inline-block' />{' '}
                ตรงกับการค้นหา
              </span>
            )}
            {editMode && (
              <span className='flex items-center gap-1'>
                <span className='w-4 h-4 rounded border-2 border-green-400 bg-green-50 inline-block' />{' '}
                เป้าหมายการย้าย
              </span>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className='w-72 flex-shrink-0'>
            <div className='bg-white rounded-xl border border-gray-200 p-4'>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='font-bold text-gray-800 text-lg'>
                  ชั้นวาง {selected}
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className='text-gray-400 hover:text-gray-600 text-sm'
                >
                  ✕
                </button>
              </div>

              {editMode && (
                <p className='text-xs text-amber-600 mb-2'>
                  ☝️ ลากรายการเพื่อย้ายชั้น
                </p>
              )}

              <div className='space-y-2 max-h-80 overflow-y-auto'>
                {selectedVariants.map((v) => (
                  <div
                    key={v.id}
                    draggable={editMode}
                    onDragStart={
                      editMode ? () => handleDragStart(v.id) : undefined
                    }
                    onDragEnd={editMode ? handleDragEnd : undefined}
                    className={`flex items-start justify-between py-2 border-b border-gray-100 last:border-0 transition-all ${
                      editMode
                        ? 'cursor-grab active:cursor-grabbing rounded-lg px-1 hover:bg-brand-50/50 active:opacity-50'
                        : ''
                    } ${draggingId === v.id ? 'opacity-40' : ''}`}
                  >
                    {editMode && (
                      <span className='text-gray-300 mr-1.5 mt-0.5 flex-shrink-0 select-none'>
                        ⠿
                      </span>
                    )}
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-700 truncate'>
                        {v.product?.name ?? '—'}
                      </p>
                      <p className='text-xs text-gray-400'>
                        {[v.size, v.color].filter(Boolean).join(' / ')} ·{' '}
                        {v.sku}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ml-2 flex-shrink-0 ${
                        v.stock_quantity === 0
                          ? 'text-red-500'
                          : v.stock_quantity <= 3
                            ? 'text-yellow-600'
                            : 'text-gray-700'
                      }`}
                    >
                      {v.stock_quantity} ชิ้น
                    </span>
                  </div>
                ))}
              </div>

              <div className='mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500'>
                <span>{selectedVariants.length} รายการ</span>
                <span>
                  รวม{' '}
                  {selectedVariants.reduce((s, v) => s + v.stock_quantity, 0)}{' '}
                  ชิ้น
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
