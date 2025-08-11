import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface OtpVerificationProps {
  onVerificationComplete: () => void;
  onBack: () => void;
  email?: string;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({
  onVerificationComplete,
  onBack,
  email
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { user, verifyOtp, resendOtp, isLoading, verificationEmail } = useAuth();

  // Set up refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);
  
  // Focus the first input field when component mounts
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);
  
  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    if (otp.every(digit => digit !== '') && !isLoading && verificationStatus !== 'success') {
      // Create a small delay to allow the UI to update before submitting
      const timer = setTimeout(() => {
        const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent;
        handleSubmit(formEvent);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [otp, isLoading, verificationStatus]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Take only the last character if multiple characters are pasted
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus the next empty input or the last input if all are filled
    const nextEmptyIndex = newOtp.findIndex(val => !val);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerificationStatus('pending');

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits of the verification code');
      return;
    }

    try {
      await verifyOtp(otpValue);
      setVerificationStatus('success');
      setError('Verification successful! Redirecting...');
      
      // Short delay before redirecting for better UX
      setTimeout(() => {
        onVerificationComplete();
      }, 1500);
    } catch (err: any) {
      setVerificationStatus('error');
      // Display the error message from the server if available
      if (err.response && err.response.data) {
        if (err.response.data.error) {
          setError(err.response.data.error);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Invalid verification code. Please try again.');
        }
      } else {
        setError('Invalid verification code. Please try again.');
      }
      console.error('OTP verification error:', err);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setResendDisabled(true);
    setCountdown(60); // 60 seconds countdown
    setVerificationStatus('pending');

    try {
      await resendOtp(email);
      // Show success message
      setError('A new verification code has been sent to your email');
      // Clear the OTP fields
      setOtp(['', '', '', '', '', '']);
      // Focus the first input field
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err: any) {
       // Display the error message from the server if available
       if (err.response && err.response.data) {
         if (err.response.data.error) {
           setError(err.response.data.error);
         } else if (err.response.data.message) {
           setError(err.response.data.message);
         } else {
           setError('Failed to resend verification code. Please try again.');
         }
       } else {
         setError('Failed to resend verification code. Please try again.');
       }
       console.error('Resend OTP error:', err);
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">QUICKCOURT</h2>
        <p className="text-gray-600 mt-2">VERIFY YOUR EMAIL</p>
      </div>

      <div className="text-center mb-6">
        <p className="text-gray-600">
          We've sent a verification code to{' '}
          <span className="font-medium">{email || verificationEmail || user?.email || 'your email'}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">Please check your inbox and enter the 6-digit code below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2 text-center">
            Enter verification code
          </label>
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`w-12 h-12 text-center text-xl font-semibold border ${verificationStatus === 'error' ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                disabled={isLoading || verificationStatus === 'success'}
                required
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="text-center text-sm">
            <p className={error.includes('sent') || error.includes('successful') ? 'text-green-600' : 'text-red-600'}>
              {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || verificationStatus === 'success' || otp.join('').length !== 6}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${verificationStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
        >
          {isLoading ? 'Verifying...' : verificationStatus === 'success' ? 'Verified ✓' : 'Verify'}
        </button>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Back to Sign Up
          </button>
          
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendDisabled || isLoading}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendDisabled ? `Resend code (${countdown}s)` : 'Resend code'}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Didn't receive the code? Check your spam folder or click "Resend code"</p>
        <p className="mt-1">The verification code will expire in 10 minutes</p>
      </div>
    </div>
  );
};

export default OtpVerification;