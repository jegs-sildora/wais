const Modal = ({ children, onClose }) => {
  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl relative">
              {/* Close button */}
              <button
                  className="absolute -top-6 -right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white text-foreground  text-3xl font-bold shadow-lg"
                  onClick={onClose}
              >
                  &times;
              </button>
              {children}
          </div>
      </div>
  );
};

export default Modal;