import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Access token is required' }, { status: 400 });
    }

    // 1. 네이버 유저 정보 조회 (OIDC sub 매핑 에러 해결을 위해 직접 조회)
    const naverResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const naverData = await naverResponse.json();

    // 네이버 응답 구조: { resultcode: '00', message: 'success', response: { id: '...', email: '...', ... } }
    if (naverData.resultcode !== '00') {
      return NextResponse.json({ success: false, error: 'Failed to fetch Naver profile' }, { status: 401 });
    }

    const { id, email, nickname, profile_image } = naverData.response;

    // 2. Firebase Custom UID 생성 (naver:id 형식 권장)
    const firebaseUid = `naver:${id}`;

    // 3. Firebase 유저 정보 업데이트 또는 생성 (선택 사항)
    try {
      await adminAuth.updateUser(firebaseUid, {
        email: email || undefined,
        displayName: nickname || undefined,
        photoURL: profile_image || undefined,
      });
    } catch (error: any) {
      // 유저가 없는 경우 새로 생성
      if (error.code === 'auth/user-not-found') {
        await adminAuth.createUser({
          uid: firebaseUid,
          email: email || undefined,
          displayName: nickname || undefined,
          photoURL: profile_image || undefined,
        });
      } else {
        throw error;
      }
    }

    // 4. Firebase Custom Token 발급
    try {
      const customToken = await adminAuth.createCustomToken(firebaseUid);
      return NextResponse.json({ success: true, customToken });
    } catch (tokenError: any) {
      console.error('❌ [Naver Auth] Custom Token Generation Failed:', tokenError);
      
      // 구체적인 에러 메시지 반환
      return NextResponse.json({ 
        success: false, 
        error: '서버 인증 권한 오류가 발생했습니다.',
        detail: tokenError.message,
        hint: 'FIREBASE_SERVICE_ACCOUNT_KEY 환경변수가 올바른 JSON 형식인지 확인하세요.'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Naver Auth Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
