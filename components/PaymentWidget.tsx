'use client';

import { useEffect, useRef, useState } from 'react';
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { nanoid } from 'nanoid';
import { useAuth } from '@/lib/auth';
import { Loader2, Moon, AlertTriangle, Sparkles } from 'lucide-react';

// 키 세정 로직: 알파벳, 숫자, _ 외의 모든 문자(따옴표, 공백 등)를 제거
const rawKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5yaAdv5gc1P4dGzAY3VQEMzjn01';
const clientKey = rawKey.replace(/[^a-zA-Z0-9_]/g, '');

export default function PaymentWidget({ resultId, onCancel }: { resultId: string, onCancel: () => void }) {
  const { user } = useAuth();
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientKey || clientKey.length < 5) {
      setError('Toss Client Key가 유효하지 않습니다. 환경 변수를 확인해주세요.');
      setLoading(false);
      return;
    }

    const initWidget = async () => {
      try {
        const customerKey = user?.uid ? user.uid.replace(/[^a-zA-Z0-9_-]/g, '') : 'ANONYMOUS';
        const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
        
        await paymentWidget.renderPaymentMethods(
          '#payment-method',
          { value: 777 },
          { variantKey: 'DEFAULT' }
        );
        
        await paymentWidget.renderAgreement('#agreement', { variantKey: 'AGREEMENT' });

        paymentWidgetRef.current = paymentWidget;
        setLoading(false);
      } catch (err: any) {
        console.error('❌ Widget Initialization Error:', err);
        setError(`결제 위젯 로드 실패: ${err.message || '인증 오류'}`);
        setLoading(false);
      }
    };

    initWidget();
  }, [user]);

  const handlePaymentRequest = async () => {
    const paymentWidget = paymentWidgetRef.current;
    if (!paymentWidget) {
      alert('결제창이 아직 준비되지 않았습니다. 잠시만 기다려주세요.');
      return;
    }

    try {
      const orderId = nanoid();
      await paymentWidget.requestPayment({
        orderId,
        orderName: '운명의 속삭임 프리미엄 분석',
        customerName: user?.displayName || '방문자',
        customerEmail: user?.email || '',
        successUrl: `${window.location.origin}/api/payments/confirm?resultId=${resultId}`,
        failUrl: `${window.location.origin}/result/${resultId}?payment=fail`,
      });
    } catch (err: any) {
      console.error('❌ Payment Request Error:', err);
      alert(`결제 요청 실패: ${err.message || '알 수 없는 오류'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-8 pb-0 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-xs font-black italic">
            <Sparkles className="w-3.5 h-3.5 fill-primary-400 text-primary-400" />
            PREMIUM UNLOCK
          </div>
          <h3 className="text-2xl font-black text-primary-900">운명의 속삭임 열기</h3>
          <p className="text-primary-300 font-bold text-sm">777원으로 마법 같은 조언을 확인하세요.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 min-h-[350px] flex flex-col">
          {loading && !error && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="w-10 h-10 text-primary-400 animate-spin stroke-[3]" />
              <p className="text-primary-200 font-black animate-pulse">결제창을 불러오고 있어요...</p>
            </div>
          )}
          
          {error && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-red-500 px-8 text-center py-20">
              <AlertTriangle className="w-12 h-12" />
              <p className="font-bold text-sm">{error}</p>
              <button onClick={() => window.location.reload()} className="text-xs underline text-gray-400">페이지 새로고침</button>
            </div>
          )}

          <div id="payment-method" className={loading || error ? 'hidden' : 'w-full'} />
          <div id="agreement" className={loading || error ? 'hidden' : 'w-full'} />
        </div>

        {!error && (
          <div className="p-8 pt-0 space-y-3">
            <button 
              onClick={handlePaymentRequest}
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-6 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              777원 결제하고 확인하기
            </button>
            <button 
              onClick={onCancel}
              className="w-full py-4 text-gray-300 font-black text-xs hover:text-primary-400 transition-colors"
            >
              다음에 할게요
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
