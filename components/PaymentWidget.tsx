'use client';

import { useEffect, useRef, useState } from 'react';
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { nanoid } from 'nanoid';
import { useAuth } from '@/lib/auth';
import { Loader2, Zap } from 'lucide-react';

// 환경 변수 설정 안내:
// NEXT_PUBLIC_TOSS_CLIENT_KEY: 토스페이먼츠 개발자 센터에서 발급받은 클라이언트 키
const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5ya Adv5gc1P4dGzAY3VQEMzjn01'; // 테스트용 기본값

export default function PaymentWidget({ resultId, onCancel }: { resultId: string, onCancel: () => void }) {
  const { user } = useAuth();
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentWidget = async () => {
      try {
        const paymentWidget = await loadPaymentWidget(clientKey, user?.uid || 'ANONYMOUS');
        
        // 결제 위젯 렌더링
        const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
          '#payment-method',
          { value: 777 },
          { variantKey: 'DEFAULT' }
        );

        // 이용약관 위젯 렌더링
        paymentWidget.renderAgreement('#agreement', { variantKey: 'AGREEMENT' });

        paymentWidgetRef.current = paymentWidget;
        paymentMethodsWidgetRef.current = paymentMethodsWidget;
        setLoading(false);
      } catch (error) {
        console.error('결제 위젯 로드 실패:', error);
      }
    };

    fetchPaymentWidget();
  }, [user]);

  const handlePaymentRequest = async () => {
    const paymentWidget = paymentWidgetRef.current;

    try {
      await paymentWidget?.requestPayment({
        orderId: nanoid(),
        orderName: '사주 치트키 프리미엄 분석',
        customerName: user?.displayName || '방문자',
        customerEmail: user?.email || '',
        successUrl: `${window.location.origin}/api/payments/confirm?resultId=${resultId}`,
        failUrl: `${window.location.origin}/result/${resultId}?payment=fail`,
      });
    } catch (error) {
      console.error('결제 요청 실패:', error);
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
          <p className="text-gray-500 font-bold text-sm">행운의 777원으로 모든 풀이를 확인하세요!</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {loading && (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-[#FEE500] animate-spin stroke-[3]" />
              <p className="text-gray-400 font-black animate-pulse">결제창을 준비하고 있어요...</p>
            </div>
          )}
          <div id="payment-method" className="w-full" />
          <div id="agreement" className="w-full" />
        </div>

        <div className="p-8 pt-0 space-y-3">
          <button 
            onClick={handlePaymentRequest}
            disabled={loading}
            className="w-full bg-[#FEE500] hover:bg-[#FDD000] text-[#3C1E1E] py-6 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-50"
          >
            행운의 777원 결제하고 결과 보기
          </button>
          <button 
            onClick={onCancel}
            className="w-full py-4 text-gray-400 font-black text-sm hover:text-gray-600 transition-colors"
          >
            다음에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}
