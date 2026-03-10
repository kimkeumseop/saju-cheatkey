import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

// 503 에러 대응 재시도 로직
async function chatWithRetry(chatSession: any, message: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await chatSession.sendMessage(message);
    } catch (error: any) {
      const isServiceUnavailable = error.message?.includes('503') || error.message?.includes('Service Unavailable');
      if (isServiceUnavailable && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}

export async function POST(req: Request) {
  try {
    const { uid, chatId, message } = await req.json();

    if (!uid || !chatId || !message) {
      return NextResponse.json({ error: '필수 데이터가 누락되었습니다.' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
    }

    // 1. Firestore에서 기존 대화 내역 불러오기
    const chatRef = doc(db, 'users', uid, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);
    
    let history = [];
    if (chatSnap.exists()) {
      history = chatSnap.data().history || [];
    } else {
      // 문서가 없으면 초기 생성
      await setDoc(chatRef, { history: [], createdAt: new Date().toISOString() });
    }

    // 2. 제미나이 startChat 세션 초기화
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const chat = model.startChat({
      history: history.map((item: any) => ({
        role: item.role,
        parts: [{ text: item.parts }]
      })),
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // 3. 메시지 전송 및 답변 수신
    const result = await chatWithRetry(chat, message);
    const responseText = result.response.text();

    // 4. Firestore에 질문과 답변 동시 업데이트 (arrayUnion 사용)
    const userMessage = { role: 'user', parts: message, timestamp: new Date().toISOString() };
    const modelMessage = { role: 'model', parts: responseText, timestamp: new Date().toISOString() };

    await updateDoc(chatRef, {
      history: arrayUnion(userMessage, modelMessage)
    });

    return NextResponse.json({ 
      success: true, 
      reply: responseText,
      history: [...history, userMessage, modelMessage]
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '대화 처리 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
