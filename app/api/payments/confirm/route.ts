import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

// 환경 변수 설정 안내:
// TOSS_SECRET_KEY: 토스페이먼츠 개발자 센터에서 발급받은 시크릿 키
const secretKey = process.env.TOSS_SECRET_KEY || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  
  // URL 파라미터에서 resultId 가져오기
  const resultId = searchParams.get('resultId');

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.redirect(new URL('/fail?message=결제 정보가 누락되었습니다.', req.url));
  }

  // 1. 금액 검증 (777원인지 확인)
  if (amount !== '777') {
    console.error('결제 금액 조작 의심:', amount);
    return NextResponse.redirect(new URL('/fail?message=비정상적인 결제 금액입니다.', req.url));
  }

  try {
    // 2. 토스페이먼츠 결제 승인 API 호출
    const encryptedSecretKey = Buffer.from(`${secretKey}:`).toString('base64');
    
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('결제 승인 실패:', errorData);
      return NextResponse.redirect(new URL(`/fail?message=${errorData.message || '결제 승인에 실패했습니다.'}`, req.url));
    }

    const paymentData = await response.json();

    // 3. 결제 성공 시 Firebase Firestore 업데이트 (해당 결과의 isPaid를 true로 변경)
    if (resultId) {
      if (resultId.startsWith('local_')) {
        // 로컬 데이터인 경우는 클라이언트 단에서 처리해야 함 (Next.js 서버 라우트에서는 불가능)
        // 일단 리다이렉트 후 클라이언트에서 payment=success를 보고 로컬 스토리지 업데이트를 할 수 있도록 넘김
      } else {
        const resultRef = doc(db, 'sajuResults', resultId);
        const resultSnap = await getDoc(resultRef);

        if (resultSnap.exists()) {
          await updateDoc(resultRef, {
            isPaid: true,
            paymentKey: paymentKey,
            paidAt: new Date().toISOString()
          });
        }
      }
    }

    // 4. 결제 완료 후 결과 페이지로 리다이렉트
    return NextResponse.redirect(new URL(`/result/${resultId}?payment=success`, req.url));

  } catch (error: any) {
    console.error('결제 처리 중 오류 발생:', error);
    return NextResponse.redirect(new URL('/fail?message=서버 통신 중 오류가 발생했습니다.', req.url));
  }
}
