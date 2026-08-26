import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  departmentName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  isOpen,
  departmentName,
  onClose,
  onConfirm,
}: ConfirmModalProps): React.ReactElement | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-[#B6CDD8]/50">
        <h3 className="text-lg font-bold text-red-600 mb-1">Reset Counter?</h3>
        <p className="text-xs text-[#5C63A5] mb-4">
          Are you sure you want to reset the token count for <strong>{departmentName}</strong> to 0? This action is immediately synchronized to all live displays.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-xs font-bold text-[#5C63A5] hover:bg-[#EEF1F2] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
          >
            Confirm Reset
          </button>
        </div>
      </div>
    </div>
  );
}
