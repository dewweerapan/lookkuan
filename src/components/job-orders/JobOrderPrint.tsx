'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface JobPrintData {
  order_number: string
  customer_name: string
  customer_phone: string
  description: string
  garment_type?: string | null
  quantity: number
  quoted_price: number
  deposit_amount: number
  balance_due: number
  status: string
  estimated_completion_date?: string | null
  notes?: string | null
}

interface Props {
  job: JobPrintData
  storeName?: string
  storePhone?: string
}

export default function JobOrderPrint({ job, storeName = 'LookKuan', storePhone }: Props) {
  const [printDate, setPrintDate] = useState<string | null>(null)
  useEffect(() => {
    setPrintDate(new Date().toISOString())
  }, [])

  const handlePrint = () => window.print()

  return (
    <>
      {/* Print button — hidden when printing */}
      <button onClick={handlePrint} className="pos-btn-secondary text-sm px-4 py-2 print:hidden">
        🖨️ พิมพ์ใบงาน
      </button>

      {/* Print content — hidden on screen, visible when printing */}
      <div className="hidden print:block">
        <style>{`
          @media print {
            body > * { display: none !important; }
            #job-print-content { display: block !important; }
          }
        `}</style>
        <div
          id="job-print-content"
          style={{ fontFamily: "'Sarabun', sans-serif", padding: '24px', maxWidth: '800px', margin: '0 auto' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px' }}>{storeName}</h1>
            {storePhone && <p style={{ margin: '0', color: '#555', fontSize: '14px' }}>โทร: {storePhone}</p>}
            <h2 style={{ fontSize: '18px', margin: '8px 0 0', fontWeight: 'bold' }}>ใบงานปัก</h2>
          </div>

          {/* Order Number & Date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <span style={{ color: '#555', fontSize: '13px' }}>เลขที่ใบงาน: </span>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{job.order_number}</span>
            </div>
            <div style={{ color: '#555', fontSize: '13px' }}>
              วันที่: {printDate ? formatDate(printDate) : ''}
            </div>
          </div>

          {/* Customer */}
          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>ข้อมูลลูกค้า</div>
            <p style={{ margin: '4px 0', fontWeight: 'bold', fontSize: '18px' }}>{job.customer_name}</p>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>โทร: {job.customer_phone}</p>
          </div>

          {/* Job Details */}
          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>รายละเอียดงาน</div>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>รายละเอียดการปัก:</strong> {job.description}
            </p>
            {job.garment_type && (
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>ประเภทเสื้อ:</strong> {job.garment_type}
              </p>
            )}
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>จำนวน:</strong> {job.quantity} ตัว
            </p>
            {job.estimated_completion_date && (
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>กำหนดเสร็จ:</strong> {formatDate(job.estimated_completion_date)}
              </p>
            )}
            {job.notes && (
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>หมายเหตุ:</strong> {job.notes}
              </p>
            )}
          </div>

          {/* Payment Summary */}
          <div style={{ border: '2px solid #000', borderRadius: '8px', padding: '12px', marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>สรุปการเงิน</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
              <span>ราคาที่เสนอ</span>
              <span style={{ fontWeight: 'bold' }}>{formatCurrency(job.quoted_price)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span>มัดจำ</span>
              <span style={{ color: 'green' }}>-{formatCurrency(job.deposit_amount)}</span>
            </div>
            <div style={{ borderTop: '1px solid #ccc', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>ยอดค้างชำระ</span>
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: job.balance_due > 0 ? '#ea580c' : '#16a34a' }}>
                {formatCurrency(job.balance_due)}
              </span>
            </div>
          </div>

          {/* Signature Lines */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '8px', paddingTop: '48px' }} />
              <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>ลายเซ็นลูกค้า</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '8px', paddingTop: '48px' }} />
              <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>ลายเซ็นพนักงาน</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
