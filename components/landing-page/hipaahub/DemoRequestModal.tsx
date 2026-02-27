'use client';

import React, { useState } from 'react';
import { X, Mail, User, Phone, ArrowRight } from 'lucide-react';

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoRequestModal: React.FC<DemoRequestModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          source: 'demo_request'
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit request');
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({ name: '', email: '', phone: '' });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-none border border-gray-200 shadow-2xl relative animate-reveal">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-cisco-navy transition-colors z-10"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {isSuccess ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-cisco-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-cisco-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-thin text-cisco-navy mb-4">Thank You!</h3>
            <p className="text-gray-600 font-thin">
              We'll be in touch shortly to schedule your demo.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-cisco-navy p-8 text-white">
              <h2 className="text-3xl font-thin mb-2">Request Platform Demo</h2>
              <p className="text-gray-300 text-sm font-thin">
                Schedule a personalized demo of HIPAA Hub's compliance infrastructure.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-thin">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-thin text-cisco-navy mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-cisco-blue focus:outline-none font-thin text-cisco-navy bg-white placeholder:text-gray-400"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-thin text-cisco-navy mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-cisco-blue focus:outline-none font-thin text-cisco-navy bg-white placeholder:text-gray-400"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-thin text-cisco-navy mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-cisco-blue focus:outline-none font-thin text-cisco-navy bg-white placeholder:text-gray-400"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-cisco-blue text-white px-8 py-4 text-sm font-thin hover:bg-cisco-navy transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      Submit Request
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-4 text-sm font-thin text-gray-600 hover:text-cisco-navy transition-colors border border-gray-200 hover:border-cisco-navy"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default DemoRequestModal;
