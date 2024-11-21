interface PublishConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function PublishConfirmation({ onConfirm, onCancel }: PublishConfirmationProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-md p-6 bg-[#0f0035] rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Confirm Publication</h3>
        <p className="text-white/60 mb-6">
          Are you sure you want to publish? Once published, this content cannot be edited.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
