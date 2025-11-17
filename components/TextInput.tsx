
import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, ...props }) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <input
        type="text"
        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
        {...props}
      />
    </div>
  );
};
