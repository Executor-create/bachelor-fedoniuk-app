import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { InputOTP } from '../components/ui/InputOTP';
import { InputOTPSlot } from '../components/ui/InputOTPSlot';
import { InputOTPGroup } from '../components/ui/InputOTPGroup';
import { verifyOtp } from '../api/auth';
import {
  getItemFromLocalStorage,
  removeItemFromLocalStorage,
  setItemToLocalStorage,
} from '../utils/localStorage';
import { LuGamepad2 } from 'react-icons/lu';
import { MdArrowBack } from 'react-icons/md';
import { FiShield, FiClock, FiRefreshCw, FiCheck } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

export default function OTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  const routeUserId = (location.state as { userId?: string } | null)?.userId;
  const storedUserId = getItemFromLocalStorage('userId');
  const userId = routeUserId ?? storedUserId;

  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isValidVerifyResponse = (response: any): boolean => {
    const hasLoginPayload =
      typeof response.accessToken === 'string' &&
      response.accessToken.length > 0 &&
      typeof response.refreshToken === 'string' &&
      response.refreshToken.length > 0;

    const message =
      typeof response.message === 'string'
        ? response.message.toLowerCase()
        : '';
    return (
      response.success === true ||
      hasLoginPayload ||
      message.includes('verified') ||
      response.statusCode === 200
    );
  };

  const saveAuthentication = (response: any): void => {
    if (typeof response.accessToken === 'string') {
      setItemToLocalStorage('token', response.accessToken);
    }
    if (typeof response.refreshToken === 'string') {
      setItemToLocalStorage('refreshToken', response.refreshToken);
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.trim().replace(/\D/g, '');

    if (enteredOtp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (!userId) {
      setError('User ID is missing. Please restart the flow.');
      navigate('/login');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await verifyOtp({ otp: enteredOtp, userId });
      console.debug('verifyOtp response', response);

      if (isValidVerifyResponse(response)) {
        removeItemFromLocalStorage('userId');
        saveAuthentication(response);
        await refreshUser();
        navigate('/');
      } else {
        setError('Invalid code. Please try again.');
        setOtp('');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
      setOtp('');
      console.error('OTP verify failed', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    setIsResending(true);
    setError('');
    setTimeout(() => {
      setTimeLeft(300);
      setIsResending(false);
      setOtp('');
    }, 1000);
  };

  useEffect(() => {
    if (otp.length === 6) {
      const form = document.getElementById('otp-form') as HTMLFormElement;
      form?.requestSubmit();
    }
  }, [otp]);

  const canResend = timeLeft <= 240;

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <div className="absolute -top-40 right-0 h-105 w-105 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35),rgba(99,102,241,0))] blur-3xl" />
      <div className="absolute -bottom-48 left-0 h-105 w-105 rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.35),rgba(139,92,246,0))] blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,15,23,0.7),rgba(9,9,12,0.95))]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12 lg:py-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              <LuGamepad2 className="text-violet-300" size={18} />
              <span className="font-google">Klyro security</span>
            </div>

            <h1 className="font-google text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Verify your identity
            </h1>
            <p className="max-w-xl text-base leading-7 text-zinc-400">
              A 6-digit code was sent to your email. Enter it below to confirm
              your account and start your Klyro journey.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: <FiShield size={16} className="text-violet-400" />,
                  title: 'One-time code',
                  body: 'Each code is unique and expires after 5 minutes.',
                },
                {
                  icon: <FiClock size={16} className="text-violet-400" />,
                  title: '5-minute window',
                  body: 'Check your inbox and enter the code quickly.',
                },
                {
                  icon: <FiRefreshCw size={16} className="text-violet-400" />,
                  title: 'Resend anytime',
                  body: "Didn't get it? Request a fresh code instantly.",
                },
                {
                  icon: <FiCheck size={16} className="text-violet-400" />,
                  title: 'Instant access',
                  body: 'Verified accounts unlock full Klyro features.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {item.icon}
                    <h3 className="text-sm font-semibold text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs leading-5 text-zinc-400">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="relative">
            <div className="absolute -inset-1 rounded-4xl bg-linear-to-br from-violet-500/20 via-transparent to-violet-500/10 blur-xl" />

            <form id="otp-form" onSubmit={handleVerify} className="relative">
              <div className="border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/60 backdrop-blur rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Enter verification code
                    </h2>
                    <p className="mt-1 text-xs text-zinc-400">
                      We sent a 6-digit code to your email.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-zinc-300">
                    Secure
                  </div>
                </div>

                <div className="flex flex-col items-center gap-5">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => {
                      setOtp(value);
                      setError('');
                    }}
                    disabled={isVerifying || timeLeft === 0}
                  >
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-12 h-14 text-lg bg-zinc-950/70 border-zinc-800 text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 rounded-xl transition"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>

                  {error && (
                    <div className="w-full flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div
                    className={`flex items-center gap-2 text-sm ${timeLeft <= 60 ? 'text-red-400' : 'text-zinc-400'}`}
                  >
                    <FiClock size={14} />
                    {timeLeft > 0 ? (
                      <span>
                        Code expires in{' '}
                        <span className="font-mono font-semibold">
                          {formatTime(timeLeft)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-red-400 font-semibold">
                        Code expired
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otp.length !== 6 || isVerifying || timeLeft === 0}
                  className="mt-6 w-full rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition hover:from-violet-400 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying…
                    </span>
                  ) : (
                    'Verify Code'
                  )}
                </button>

                <div className="mt-5 pt-5 border-t border-white/10 text-center">
                  <p className="text-xs text-zinc-500 mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending || !canResend}
                    className="text-sm font-semibold text-violet-400 hover:text-violet-300 disabled:text-zinc-600 disabled:cursor-not-allowed transition"
                  >
                    {isResending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : !canResend ? (
                      <span className="text-zinc-500">
                        Resend in{' '}
                        <span className="font-mono">
                          {formatTime(300 - timeLeft)}
                        </span>
                      </span>
                    ) : (
                      'Resend Code'
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="text-center mt-5">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition"
              >
                <MdArrowBack size={15} />
                Back to Login
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
