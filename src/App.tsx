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
import { AlertCircle, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

const ORDER_STORAGE_KEY = 'oweek_2026_dept_order';

export const App: React.FC = () => {
  const [counters, setCounters] = useState<Record<string, DepartmentCounter>>({});
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>('Just now');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null);

  // Department sequence state
  const [departmentOrder, setDepartmentOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(ORDER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === DEPARTMENTS.length) {
          return parsed;
        }
      }
    } catch {
      // fallback to default
    }
    return DEPARTMENTS.map((d) => d.id);
  });

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

  const moveDepartment = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= departmentOrder.length) return;

    const newOrder = [...departmentOrder];
    const [movedItem] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, movedItem);

    setDepartmentOrder(newOrder);
    try {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(newOrder));
    } catch (e) {
      console.warn('Could not cache sequence', e);
    }
  };

  const resetDepartmentOrder = () => {
    const defaultOrder = DEPARTMENTS.map((d) => d.id);
    setDepartmentOrder(defaultOrder);
    localStorage.removeItem(ORDER_STORAGE_KEY);
  };

  // Ordered list of department items
  const sortedDepartments = departmentOrder
    .map((id) => DEPARTMENTS.find((d) => d.id === id))
    .filter((dept): dept is typeof DEPARTMENTS[0] => Boolean(dept));

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-[#EEF1F2]">
      {/* Decorative O'Week 2026 Background Watermark */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none select-none flex items-center justify-center z-0 overflow-hidden"
      >
        <span className="text-[12vw] font-black tracking-tighter text-[#0B3D5C] opacity-[0.05] whitespace-nowrap rotate-[-8deg]">
          O'Week 2026
        </span>
      </div>

      {/* Main UI Components */}
      <div className="relative z-10 flex flex-col min-h-screen">
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

          {/* Admin Department Reordering Bar */}
          {currentUser && (
            <section aria-label="Admin sequence controls" className="mt-6 p-4 bg-white/90 backdrop-blur-sm border border-[#B6CDD8] rounded-2xl shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-sm font-bold text-[#0B3D5C]">Display Sequence Configuration</h2>
                  <p className="text-xs text-[#5C63A5]">Reorder department cards to adjust dashboard placement.</p>
                </div>
                <button
                  onClick={resetDepartmentOrder}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#0B3D5C] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium transition self-start sm:self-auto"
                >
                  <RotateCcw size={13} />
                  Reset Order
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sortedDepartments.map((dept, index) => (
                  <div
                    key={dept.id}
                    className="flex items-center gap-1 bg-[#EEF1F2] border border-[#B6CDD8] px-2.5 py-1 rounded-lg text-xs font-semibold text-[#0B3D5C]"
                  >
                    <span>{dept.name}</span>
                    <div className="flex items-center ml-1 border-l border-[#B6CDD8] pl-1">
                      <button
                        onClick={() => moveDepartment(index, 'left')}
                        disabled={index === 0}
                        title="Move left"
                        className="p-0.5 hover:bg-white rounded disabled:opacity-30 disabled:cursor-not-allowed text-[#4A3A8C]"
                      >
                        <ArrowLeft size={12} />
                      </button>
                      <button
                        onClick={() => moveDepartment(index, 'right')}
                        disabled={index === sortedDepartments.length - 1}
                        title="Move right"
                        className="p-0.5 hover:bg-white rounded disabled:opacity-30 disabled:cursor-not-allowed text-[#4A3A8C]"
                      >
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {sortedDepartments.map((dept) => {
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

        <footer className="border-t border-[#B6CDD8]/60 bg-white/80 backdrop-blur-sm py-6 text-center text-sm font-semibold text-[#0B3D5C]">
          <p>© Registration Team O'Week 2026</p>
        </footer>
      </div>

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
