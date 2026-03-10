'use client';

import { useEffect, useRef, useState } from 'react';
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { nanoid } from 'nanoid';
import { useAuth } from '@/lib/auth';
import { Loader2, Zap, AlertTriangle } from 'lucide-react';

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

export default function PaymentWidget({ resultId, onCancel }: { resultId: string, onCancel: () => void }) {
  const { user } = useAuth();
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Client Key 체크
    console.log('🛠️ Toss Client Key Check:', clientKey);
    if (!clientKey) {
      const msg = 'Toss Client Key가 설정되지 않았습니다. .env.local 파일을 확인해주세요.';
      console.error('❌', msg);
      alert(msg);
      setError(msg);
      setLoading(false);
      return;
    }

    const initWidget = async () => {
      try {
        console.log('🚀 Initializing Toss Payment Widget...');
        // 2. SDK 로드
        const paymentWidget = await loadPaymentWidget(clientKey, user?.uid || 'ANONYMOUS');
        console.log('✅ PaymentWidget Object Created:', paymentWidget);

        // 3. 결제 수단 렌더링
        // #payment-method 요소가 DOM에 존재하는지 확인 후 렌더링
        paymentWidget.renderPaymentMethods(
          '#payment-method',
          { value: 777 },
          { variantKey: 'DEFAULT' }
        );
        console.log('🎨 Payment Methods Rendered to #payment-method');

        // 4. 이용약관 렌더링
        paymentWidget.renderAgreement('#agreement', { variantKey: 'AGREEMENT' });
        console.log('📝 Agreement Rendered to #agreement');

        paymentWidgetRef.current = paymentWidget;
        setLoading(false);
      } catch (err: any) {
        console.error('❌ Widget Initialization Error:', err);
        setError('결제 위젯 로딩 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    initWidget();
  }, [user]);

  const handlePaymentRequest = async () => {
    const paymentWidget = paymentWidgetRef.current;
    console.log('💳 Payment Request Triggered. Widget State:', !!paymentWidget);

    if (!paymentWidget) {
      alert('결제 위젯이 아직 준비되지 않았습니다.');
      return;
    }

    try {
      const orderId = nanoid();
      const successUrl = `${window.location.origin}/api/payments/confirm?resultId=${resultId}`;
      const failUrl = `${window.location.origin}/result/${resultId}?payment=fail`;

      console.log('🔗 Success URL:', successUrl);
      console.log('🔗 Fail URL:', failUrl);

      await paymentWidget.requestPayment({
        orderId,
        orderName: '사주 치트키 프리미엄 분석',
        customerName: user?.displayName || '방문자',
        customerEmail: user?.email || '',
        successUrl,
        failUrl,
      });
      
      console.log('✅ requestPayment Function Called Successfully');
    } catch (err: any) {
      console.error('❌ requestPayment Error:', err);
      alert(`결제 요청 실패: ${err.message || '알 수 없는 오류'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-8 pb-0 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FEE500]/20 text-[#3C1E1E] text-xs font-black italic">
            <Zap className="w-3.5 h-3.5 fill-[#FEE500]" />
            PREMIUM UNLOCK
          </div>
          <h3 className="text-2xl font-black text-[#3C1E1E]">치트키 충전하기</h3>
          <p className="text-gray-500 font-bold text-sm">777원으로 모든 풀이를 확인하세요!</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 min-h-[300px]">
          {loading && (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-[#FEE500] animate-spin stroke-[3]" />
              <p className="text-gray-400 font-black animate-pulse">결제창을 준비하고 있어요...</p>
            </div>
          )}
          
          {error && (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-red-500 px-8 text-center">
              <AlertTriangle className="w-12 h-12" />
              <p className="font-bold">{error}</p>
              <button onClick={() => window.location.reload()} className="text-sm underline text-gray-400">다시 시도하기</button>
            </div>
          )}

          {/* ID가 정확히 일치해야 함 */}
          <div id="payment-method" className="w-full" />
          <div id="agreement" className="w-full" />
        </div>

        {!error && (
          <div className="p-8 pt-0 space-y-3">
            <button 
              onClick={handlePaymentRequest}
              disabled={loading}
              className="w-full bg-[#FEE500] hover:bg-[#FDD000] text-[#3C1E1E] py-6 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              777원 결제하고 결과 보기
            </button>
            <button 
              onClick={onCancel}
              className="w-full py-4 text-gray-400 font-black text-sm hover:text-gray-600 transition-colors"
            >
              다음에 할게요
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
