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
  deleteProfile: (profileId: string) => Promise<void>; // 삭제 함수 추가
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
  const [userCheatKeys, setUserCheatKeys] = useState(0);

  const fetchProfiles = async (uid: string) => {
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
    let unsubscribeUserDoc: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchProfiles(currentUser.uid);
        unsubscribeUserDoc = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
          if (docSnap.exists()) setUserCheatKeys(docSnap.data().cheatCoin || 0);
          else setUserCheatKeys(0);
        });
      } else {
        setUser(null);
        setUserCheatKeys(0);
        const saved = localStorage.getItem('saju_profiles');
        if (saved) setProfiles(JSON.parse(saved));
        else setProfiles([]);
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
      if (user) {
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

  // 프로필 삭제 함수 구현
  const deleteProfile = async (profileId: string) => {
    try {
      if (user) {
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
    if (user) await fetchProfiles(user.uid);
  };

  const loginWithGoogle = async () => {
    try { await signInWithPopup(auth, googleProvider); } catch (error) { throw error; }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try { await signInWithEmailAndPassword(auth, email, pass); } catch (error) { throw error; }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
    } catch (error) { throw error; }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setProfiles([]);
    } catch (error) { console.error('로그아웃 실패:', error); }
  };

  return (
    <AuthContext.Provider value={{ user, loading, profiles, userCheatKeys, addProfile, deleteProfile, refreshProfiles, loginWithGoogle, loginWithEmail, signUpWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
