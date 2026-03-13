'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signOut, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithCustomToken
} from 'firebase/auth';
import { auth, googleProvider, db, hasFirebasePublicConfig } from './firebase';
import { collection, query, getDocs, addDoc, serverTimestamp, orderBy, doc, onSnapshot, deleteDoc } from 'firebase/firestore';

export type SajuProfile = {
  id?: string;
  name: string;
  birthDate: string;
  birthTime: string;
  isTimeKnown: boolean;
  isExactTime: boolean;
  calendarType: 'solar' | 'lunar';
  gender: 'male' | 'female';
  createdAt?: any;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profiles: SajuProfile[];
  userCheatKeys: number;
  addProfile: (profile: SajuProfile) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>; 
  refreshProfiles: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithNaver: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<SajuProfile[]>([]);
  const [userCheatKeys, setUserCheatKeys] = useState(0);

  const loadLocalProfiles = () => {
    try {
      const saved = localStorage.getItem('saju_profiles');
      if (saved) setProfiles(JSON.parse(saved));
      else setProfiles([]);
    } catch (error) {
      console.error('로컬 프로필 불러오기 실패:', error);
      setProfiles([]);
    }
  };

  const fetchProfiles = async (uid: string) => {
    if (!db) return;
    try {
      const q = query(collection(db, 'users', uid, 'profiles'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedProfiles: SajuProfile[] = [];
      querySnapshot.forEach((doc) => {
        fetchedProfiles.push({ id: doc.id, ...doc.data() } as SajuProfile);
      });
      setProfiles(fetchedProfiles);
      localStorage.setItem('saju_profiles', JSON.stringify(fetchedProfiles));
    } catch (error) {
      console.error('프로필 불러오기 실패:', error);
    }
  };

  useEffect(() => {
    if (!auth || !hasFirebasePublicConfig) {
      loadLocalProfiles();
      setLoading(false);
      return;
    }

    let unsubscribeUserDoc: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchProfiles(currentUser.uid);
        if (db) {
          unsubscribeUserDoc = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
            if (docSnap.exists()) setUserCheatKeys(docSnap.data().cheatCoin || 0);
            else setUserCheatKeys(0);
          });
        }
      } else {
        setUser(null);
        setUserCheatKeys(0);
        loadLocalProfiles();
      }
      setLoading(false);
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const addProfile = async (newProfile: SajuProfile) => {
    try {
      if (user && db) {
        const docRef = await addDoc(collection(db, 'users', user.uid, 'profiles'), {
          ...newProfile,
          createdAt: serverTimestamp()
        });
        const profileWithId = { ...newProfile, id: docRef.id };
        setProfiles(prev => [profileWithId, ...prev]);
      } else {
        const updatedProfiles = [{...newProfile, id: Date.now().toString()}, ...profiles].slice(0, 10);
        setProfiles(updatedProfiles);
        localStorage.setItem('saju_profiles', JSON.stringify(updatedProfiles));
      }
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      throw error;
    }
  };

  const deleteProfile = async (profileId: string) => {
    try {
      if (user && db) {
        await deleteDoc(doc(db, 'users', user.uid, 'profiles', profileId));
        setProfiles(prev => prev.filter(p => p.id !== profileId));
      } else {
        const updatedProfiles = profiles.filter(p => p.id !== profileId);
        setProfiles(updatedProfiles);
        localStorage.setItem('saju_profiles', JSON.stringify(updatedProfiles));
      }
    } catch (error) {
      console.error('프로필 삭제 실패:', error);
      throw error;
    }
  };

  const refreshProfiles = async () => {
    if (user && db) await fetchProfiles(user.uid);
  };

  const loginWithGoogle = async () => {
    if (!auth || !hasFirebasePublicConfig) throw new Error('Firebase auth is not configured.');
    try { await signInWithPopup(auth, googleProvider); } catch (error) { throw error; }
  };

  const loginWithNaver = async () => {
    try {
      // 1. 네이버 인증 팝업 열기 (클라이언트 ID 하드코딩 적용)
      const clientId = 'LLHPh6fs2bvlW54wQ3pw';
      
      // 동적으로 현재 접속 중인 도메인 기반 Redirect URI 생성
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const fullRedirectUri = `${currentOrigin}/api/auth/callback/naver`;
      
      // [Naver Login] 디버깅 로그 강제 출력
      console.log("[Naver Login] Client ID (Hardcoded):", clientId);
      console.log("[Naver Login] 요청하는 Redirect URI:", fullRedirectUri);

      const redirectUri = encodeURIComponent(fullRedirectUri);
      const state = Math.random().toString(36).substring(7);
      const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;

      const popup = window.open(naverAuthUrl, 'naverLoginPopup', 'width=500,height=600');

      if (!popup) {
        throw new Error('로그인 팝업을 열지 못했습니다. 팝업 차단을 확인해주세요.');
      }

      // 2. 팝업으로부터 엑세스 토큰 수신 (postMessage 활용)
      const accessToken = await new Promise<string>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          reject(new Error('네이버 로그인 시간이 초과되었습니다.'));
        }, 120000);

        const handleMessage = (event: MessageEvent) => {
          // 보안을 위해 오리진 확인
          if (event.origin !== window.location.origin) return;
          
          console.log("[Naver Login] Message Received:", event.data);

          if (event.data?.type === 'NAVER_AUTH_SUCCESS' && event.data.accessToken) {
            console.log("[Naver Login] Access Token Received, proceeding to backend...");
            window.clearTimeout(timeout);
            window.removeEventListener('message', handleMessage);
            resolve(event.data.accessToken);
          } else if (event.data?.type === 'NAVER_AUTH_CLOSED') {
            window.clearTimeout(timeout);
            window.removeEventListener('message', handleMessage);
            reject(new Error('로그인 창이 닫혔습니다.'));
          }
        };
        window.addEventListener('message', handleMessage);
      });

      // 3. 백엔드 API를 통해 Firebase Custom Token 발급
      const response = await fetch('/api/auth/naver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      const data = await response.json();
      if (!data.success || !data.customToken) {
        throw new Error(data.error || '네이버 인증 처리에 실패했습니다.');
      }

      // 4. 발급받은 Custom Token으로 파이어베이스 로그인 완료
      if (!auth || !hasFirebasePublicConfig) {
        throw new Error('Firebase auth is not configured.');
      }
      await signInWithCustomToken(auth, data.customToken);

    } catch (error: any) {
      console.error('Naver Login Flow Error:', error);
      alert("네이버 로그인 연동에 실패했습니다. 관리자에게 문의하세요.");
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (!auth || !hasFirebasePublicConfig) throw new Error('Firebase auth is not configured.');
    try { await signInWithEmailAndPassword(auth, email, pass); } catch (error) { throw error; }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (!auth || !hasFirebasePublicConfig) throw new Error('Firebase auth is not configured.');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
    } catch (error) { throw error; }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setProfiles([]);
    } catch (error) { console.error('로그아웃 실패:', error); }
  };

  return (
    <AuthContext.Provider value={{ user, loading, profiles, userCheatKeys, addProfile, deleteProfile, refreshProfiles, loginWithGoogle, loginWithNaver, loginWithEmail, signUpWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
