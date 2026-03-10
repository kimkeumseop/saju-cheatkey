'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signOut, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, db } from './firebase';
import { collection, query, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';

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
  addProfile: (profile: SajuProfile) => Promise<void>;
  refreshProfiles: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<SajuProfile[]>([]);

  // 1. 프로필 데이터 가져오기 함수
  const fetchProfiles = async (uid: string) => {
    try {
      const q = query(
        collection(db, 'users', uid, 'profiles'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedProfiles: SajuProfile[] = [];
      querySnapshot.forEach((doc) => {
        fetchedProfiles.push({ id: doc.id, ...doc.data() } as SajuProfile);
      });
      setProfiles(fetchedProfiles);
      // 로컬 스토리지 동기화 (백업용)
      localStorage.setItem('saju_profiles', JSON.stringify(fetchedProfiles));
    } catch (error) {
      console.error('프로필 불러오기 실패:', error);
    }
  };

  // 2. 인증 상태 감시
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(user);
      if (currentUser) {
        setUser(currentUser);
        fetchProfiles(currentUser.uid);
      } else {
        setUser(null);
        // 로그아웃 시 로컬 스토리지 데이터 로드
        const saved = localStorage.getItem('saju_profiles');
        if (saved) setProfiles(JSON.parse(saved));
        else setProfiles([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 3. 프로필 추가 함수 (DB 저장 + State 업데이트)
  const addProfile = async (newProfile: SajuProfile) => {
    try {
      if (user) {
        // 로그인 상태: Firestore 저장
        const docRef = await addDoc(collection(db, 'users', user.uid, 'profiles'), {
          ...newProfile,
          createdAt: serverTimestamp()
        });
        const profileWithId = { ...newProfile, id: docRef.id };
        setProfiles(prev => [profileWithId, ...prev]);
      } else {
        // 비로그인 상태: 로컬 스토리지 저장
        const updatedProfiles = [newProfile, ...profiles].slice(0, 10);
        setProfiles(updatedProfiles);
        localStorage.setItem('saju_profiles', JSON.stringify(updatedProfiles));
      }
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      throw error;
    }
  };

  const refreshProfiles = async () => {
    if (user) await fetchProfiles(user.uid);
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('구글 로그인 실패:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('이메일 로그인 실패:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setProfiles([]);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      profiles, 
      addProfile, 
      refreshProfiles,
      loginWithGoogle, 
      loginWithEmail, 
      signUpWithEmail, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
