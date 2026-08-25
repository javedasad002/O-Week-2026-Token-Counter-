import React, { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { db, auth } from './firebase/config';
import { Header } from './components/Header';
import { Statistics } from './components/Statistics';
import { CounterCard } from './components/CounterCard';
import { LoginModal } from './components/LoginModal';
import { ConfirmModal } from './components/ConfirmModal';
import { DEPARTMENTS, DepartmentCounter, UserProfile } from './types';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [counters, setCounters] = useState<Record<string, DepartmentCounter>>({});
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>('Just now');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const initializeDatabase = async () => {
      try {
        const countersCollection = collection(db, 'counters');
        const snapshot = await getDocs(countersCollection);
        if (snapshot.empty) {
          for (const dept of DEPARTMENTS) {
            await setDoc(doc(db, 'counters', dept.id), {
              name: dept.name,
              fullName: dept.fullName,
              value: 0,
              updatedAt: serverTimestamp(),
              updatedBy: 'System Initialization',
            });
          }
        }
      } catch (err: any) {
        console.warn('Initial seeding note:', err.message);
      }
    };

    initializeDatabase();

    const countersColRef = collection(db, 'counters');
    const unsubscribe = onSnapshot(
      countersColRef,
      (snapshot) => {
        setIsOnline(true);
        const newCounters: Record<string, DepartmentCounter> = {};
        
        DEPARTMENTS.forEach((dept) => {
          newCounters[dept.id] = {
            id: dept.id,
            name: dept.name,
            fullName: dept.fullName,
            value: 0,
            updatedAt: null,
            updatedBy: null,
          };
        });

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (newCounters[docSnap.id]) {
            newCounters[docSnap.id] = {
              ...newCounters[docSnap.id],
              value: typeof data.value === 'number' ? data.value : 0,
              updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toLocaleTimeString() : 'Just now',
              updatedBy: data.updatedBy || null,
            };
          }
        });

        setCounters(newCounters);
        setLastUpdatedText(new Date().toLocaleTimeString());
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        setIsOnline(false);
        setErrorMessage('Database connection interrupted. Changes will sync once reconnected.');
      }
    );

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleIncrement = async (id: string) => {
    try {
      setErrorMessage(null);
      const docRef = doc(db, 'counters', id);
      await updateDoc(docRef, {
        value: increment(1),
        updatedAt: serverTimestamp(),
        updatedBy: currentUser?.email || 'Staff',
      });
    } catch (err: any) {
      setErrorMessage(`Failed to increment counter: ${err.message}`);
    }
  };

  const handleDecrement = async (id: string) => {
    const currentVal = counters[id]?.value || 0;
    if (currentVal <= 0) return;

    try {
      setErrorMessage(null);
      const docRef = doc(db, 'counters', id);
      await updateDoc(docRef, {
        value: increment(-1),
        updatedAt: serverTimestamp(),
        updatedBy: currentUser?.email || 'Staff',
      });
    } catch (err: any) {
      setErrorMessage(`Failed to decrement counter: ${err.message}`);
    }
  };

  const handleConfirmReset = async () => {
    if (!resetTarget) return;
    try {
      setErrorMessage(null);
      const docRef = doc(db, 'counters', resetTarget.id);
      await updateDoc(docRef, {
        value: 0,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser?.email || 'Staff',
      });
      setResetTarget(null);
    } catch (err: any) {
      setErrorMessage(`Failed to reset counter: ${err.message}`);
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        isOnline={isOnline}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-xl flex items-center justify-between text-rose-800 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs bg-rose-200/60 hover:bg-rose-200 px-3 py-1 rounded-lg font-bold transition"
            >
              Dismiss
            </button>
          </div>
        )}

        <Statistics counters={counters} lastUpdated={lastUpdatedText} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {DEPARTMENTS.map((dept) => {
            const counterData = counters[dept.id] || {
              id: dept.id,
              name: dept.name,
              fullName: dept.fullName,
              value: 0,
              updatedAt: null,
              updatedBy: null,
            };

            return (
              <CounterCard
                key={dept.id}
                counter={counterData}
                isAuthorized={!!currentUser}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onRequestReset={(id, name) => setResetTarget({ id, name })}
                onRequireAuth={() => setIsLoginOpen(true)}
              />
            );
          })}
        </div>
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <p>O'Week 2026 Department Token Management System • Real-Time Firebase Sync</p>
      </footer>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />

      <ConfirmModal
        isOpen={!!resetTarget}
        title="Confirm Reset"
        deptName={resetTarget?.name || ''}
        onConfirm={handleConfirmReset}
        onCancel={() => setResetTarget(null)}
      />
    </div>
  );
};
