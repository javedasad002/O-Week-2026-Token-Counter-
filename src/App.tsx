import React, { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  runTransaction,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { db, auth } from './firebase/config';
import { ALL_DEPARTMENTS, DepartmentCounter } from './types';
import Header from './components/Header';
import CounterCard from './components/CounterCard';
import Statistics from './components/Statistics';
import LoginModal from './components/LoginModal';
import ConfirmModal from './components/ConfirmModal';

const ALL_DEPT_IDS = ALL_DEPARTMENTS.map((d) => d.id);

export default function App(): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [counters, setCounters] = useState<Record<string, DepartmentCounter>>({});
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  // UI Display state
  const [desiredCount, setDesiredCount] = useState<number>(3);
  const [activeDeptIds, setActiveDeptIds] = useState<string[]>(['EE', 'CIS', 'ME']);
  
  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [resetTarget, setResetTarget] = useState<DepartmentCounter | null>(null);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Ensure all 6 department documents exist in Firestore without overwriting existing tallies
  useEffect(() => {
    const verifyAndInitDocuments = async () => {
      try {
        await Promise.all(
          ALL_DEPARTMENTS.map(async (dept) => {
            const docRef = doc(db, 'counters', dept.id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
              await setDoc(
                docRef,
                {
                  name: dept.name,
                  fullName: dept.fullName,
                  value: 0,
                  updatedAt: serverTimestamp(),
                  updatedBy: 'System Initialization',
                },
                { merge: true }
              );
            }
          })
        );
      } catch (err) {
        console.error('Firestore initialization check failed:', err);
      }
    };

    verifyAndInitDocuments();
  }, []);

  // Realtime Firestore Listener
  useEffect(() => {
    const countersCol = collection(db, 'counters');
    const unsubscribe = onSnapshot(
      countersCol,
      (snapshot) => {
        const dataMap: Record<string, DepartmentCounter> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          dataMap[docSnap.id] = {
            id: docSnap.id,
            name: data.name || docSnap.id,
            fullName: data.fullName || '',
            value: typeof data.value === 'number' ? data.value : 0,
            updatedAt: data.updatedAt,
            updatedBy: data.updatedBy,
          };
        });
        setCounters(dataMap);
      },
      (error) => {
        console.error('Realtime sync error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle counter count selection (1 to 6)
  const handleDesiredCountChange = (newCount: number) => {
    const clamped = Math.max(1, Math.min(6, newCount));
    setDesiredCount(clamped);

    setActiveDeptIds((prev) => {
      if (prev.length === clamped) return prev;
      if (prev.length > clamped) {
        return prev.slice(0, clamped);
      }
      const remaining = ALL_DEPT_IDS.filter((id) => !prev.includes(id));
      const needed = clamped - prev.length;
      return [...prev, ...remaining.slice(0, needed)];
    });
  };

  // Toggle department slot selection
  const handleDepartmentToggle = (deptId: string) => {
    setActiveDeptIds((prev) => {
      if (prev.includes(deptId)) {
        if (prev.length <= 1) return prev;
        setDesiredCount(prev.length - 1);
        return prev.filter((id) => id !== deptId);
      }

      if (prev.length < desiredCount) {
        return [...prev, deptId];
      }

      // Max reached: FIFO replacement
      return [...prev.slice(1), deptId];
    });
  };

  // Transactional Atomic Increment
  const handleIncrement = useCallback(
    async (deptId: string) => {
      if (!user) {
        setIsLoginOpen(true);
        return;
      }
      try {
        const docRef = doc(db, 'counters', deptId);
        const targetMeta = ALL_DEPARTMENTS.find((d) => d.id === deptId);

        await runTransaction(db, async (transaction) => {
          const docSnap = await transaction.get(docRef);
          const currentValue = docSnap.exists() && typeof docSnap.data().value === 'number' 
            ? docSnap.data().value 
            : 0;

          transaction.set(
            docRef,
            {
              name: targetMeta?.name || deptId,
              fullName: targetMeta?.fullName || '',
              value: currentValue + 1,
              updatedAt: serverTimestamp(),
              updatedBy: user.email || 'Staff Member',
            },
            { merge: true }
          );
        });
      } catch (err) {
        console.error(`Failed to increment ${deptId}:`, err);
      }
    },
    [user]
  );

  // Transactional Atomic Decrement with guaranteed floor of 0
  const handleDecrement = useCallback(
    async (deptId: string) => {
      if (!user) {
        setIsLoginOpen(true);
        return;
      }
      try {
        const docRef = doc(db, 'counters', deptId);
        const targetMeta = ALL_DEPARTMENTS.find((d) => d.id === deptId);

        await runTransaction(db, async (transaction) => {
          const docSnap = await transaction.get(docRef);
          const currentValue = docSnap.exists() && typeof docSnap.data().value === 'number' 
            ? docSnap.data().value 
            : 0;

          // Prevent negative values
          if (currentValue <= 0) {
            return;
          }

          transaction.set(
            docRef,
            {
              name: targetMeta?.name || deptId,
              fullName: targetMeta?.fullName || '',
              value: currentValue - 1,
              updatedAt: serverTimestamp(),
              updatedBy: user.email || 'Staff Member',
            },
            { merge: true }
          );
        });
      } catch (err) {
        console.error(`Failed to decrement ${deptId}:`, err);
      }
    },
    [user]
  );

  // Transactional Reset to 0 via runTransaction
  const handleConfirmReset = useCallback(async () => {
    if (!resetTarget || !user) return;
    const targetDept = resetTarget;
    try {
      const docRef = doc(db, 'counters', targetDept.id);
      const targetMeta = ALL_DEPARTMENTS.find((d) => d.id === targetDept.id);

      await runTransaction(db, async (transaction) => {
        await transaction.get(docRef);
        transaction.set(
          docRef,
          {
            name: targetMeta?.name || targetDept.name,
            fullName: targetMeta?.fullName || targetDept.fullName,
            value: 0,
            updatedAt: serverTimestamp(),
            updatedBy: `${user.email || 'Staff Member'} (Reset)`,
          },
          { merge: true }
        );
      });
      setResetTarget(null);
    } catch (err) {
      console.error(`Failed to reset ${targetDept.id}:`, err);
    }
  }, [resetTarget, user]);

  // 2x2 layout for 4 counters, dynamic responsive layouts for other counts
  const getGridClasses = (count: number): string => {
    switch (count) {
      case 1:
        return 'grid-cols-1 max-w-md mx-auto';
      case 2:
        return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
      case 3:
        return 'grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
      case 5:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-7xl mx-auto';
      case 6:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto';
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF1F2] text-[#0B3D5C] flex flex-col font-sans">
      <Header
        user={user}
        isOnline={isOnline}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={() => signOut(auth)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Controls Panel */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-[#B6CDD8]/40 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#5C63A5]">
                Configuration
              </h2>
              <p className="text-base font-medium text-[#0B3D5C]">
                How many department counters do you want to run?
              </p>
            </div>
            {/* 1 to 6 Counter Selector */}
            <div className="flex items-center gap-1.5 bg-[#EEF1F2] p-1 rounded-lg border border-[#B6CDD8]/50">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDesiredCountChange(num)}
                  className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-md transition-all ${
                    desiredCount === num
                      ? 'bg-[#0B3D5C] text-white shadow'
                      : 'text-[#0B3D5C] hover:bg-[#B6CDD8]/40'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Department Selection Pills */}
          <div>
            <span className="block text-xs font-semibold text-[#5C63A5] uppercase tracking-wider mb-2">
              Active Departments ({activeDeptIds.length} / 6)
            </span>
            <div className="flex flex-wrap gap-2">
              {ALL_DEPARTMENTS.map((dept) => {
                const isActive = activeDeptIds.includes(dept.id);
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleDepartmentToggle(dept.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      isActive
                        ? 'bg-[#4A3A8C] text-white border-[#4A3A8C] shadow-sm'
                        : 'bg-white text-[#5C63A5] border-[#B6CDD8] hover:bg-[#EEF1F2]'
                    }`}
                  >
                    {dept.id}
                    <span className="hidden sm:inline font-normal opacity-90 ml-1">
                      - {dept.fullName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Counter Grid */}
        <div className={`grid gap-5 ${getGridClasses(activeDeptIds.length)}`}>
          {activeDeptIds.map((deptId) => {
            const fallbackMeta = ALL_DEPARTMENTS.find((d) => d.id === deptId);
            const deptData = counters[deptId] || {
              id: deptId,
              name: fallbackMeta?.name || deptId,
              fullName: fallbackMeta?.fullName || '',
              value: 0,
            };

            return (
              <CounterCard
                key={deptId}
                counter={deptData}
                isAuthenticated={!!user}
                onIncrement={() => handleIncrement(deptId)}
                onDecrement={() => handleDecrement(deptId)}
                onRequestReset={() => setResetTarget(deptData)}
                onRequireLogin={() => setIsLoginOpen(true)}
              />
            );
          })}
        </div>

        {/* Statistics Section */}
        <Statistics counters={counters} activeCount={activeDeptIds.length} />
      </main>

      <footer className="mt-auto py-4 text-center text-xs font-medium text-[#5C63A5] border-t border-[#B6CDD8]/40">
        Team Registration O'Week 2026
      </footer>

      {/* Login Modal */}
      {isLoginOpen && (
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLogin={async (email, pass) => {
            await signInWithEmailAndPassword(auth, email, pass);
            setIsLoginOpen(false);
          }}
        />
      )}

      {/* Confirm Reset Modal */}
      {resetTarget && (
        <ConfirmModal
          isOpen={!!resetTarget}
          departmentName={resetTarget.name}
          onClose={() => setResetTarget(null)}
          onConfirm={handleConfirmReset}
        />
      )}
    </div>
  );
}
