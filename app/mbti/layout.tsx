import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'MBTI 테스트',
  description: '20문항으로 빠르게 성향을 확인하는 MBTI 테스트',
};

export default function MbtiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mbti-theme">
      <Navbar />
      {children}
    </div>
  );
}
