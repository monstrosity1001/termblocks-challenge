import React from 'react';

interface SnackbarProps {
  message: string;
  onClose: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, onClose }) => (
  <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded shadow z-50 animate-fade-in">
    {message}
    <button className="ml-2 text-white font-bold" onClick={onClose}>&times;</button>
  </div>
);

export default Snackbar;
