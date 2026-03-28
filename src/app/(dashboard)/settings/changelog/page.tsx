import PageHeader from '@/components/shared/PageHeader';
import ChangelogClient from '@/components/settings/ChangelogClient';

export default function ChangelogPage() {
  return (
    <div>
      <PageHeader
        title='ความคืบหน้าการพัฒนา'
        description='ติดตามสถานะ Phase 2 แบบ real-time'
      />
      <ChangelogClient />
    </div>
  );
}
