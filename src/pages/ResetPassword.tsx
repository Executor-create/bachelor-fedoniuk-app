import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { resetPassword } from '../api/auth';
import { LuGamepad2 } from 'react-icons/lu';
import { MdOutlineLockOpen, MdArrowBack } from 'react-icons/md';
import { IoLockClosedOutline } from 'react-icons/io5';
import { FiShield, FiCheck, FiKey, FiLock } from 'react-icons/fi';
import { PASSWORD_REGEX } from '../utils/regex';

type ResetPasswordFormValues = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

const ResetPasswordPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ mode: 'onTouched' });

  const [status, setStatus] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultToken = searchParams.get('token') ?? '';

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = async (data) => {
    setStatus('');
    setIsSubmitting(true);

    try {
      const response = await resetPassword({
        token: data.token || defaultToken,
        newPassword: data.newPassword,
      });

      setStatus(
        response.message ||
          'Password reset successful. Redirecting to login...',
      );
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      setStatus(
        error?.message || 'Unable to reset password. Please try again.',
      );
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <span className="font-google">Klyro access</span>
            </div>

            <h1 className="font-google text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Set a new password
            </h1>
            <p className="max-w-xl text-base leading-7 text-zinc-400">
              Enter your reset token and choose a strong new password to secure
              your account.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: <FiKey size={16} className="text-violet-400" />,
                  title: 'Use your token',
                  body: 'Paste the reset token from the email you received.',
                },
                {
                  icon: <FiShield size={16} className="text-violet-400" />,
                  title: 'Strong password',
                  body: 'Choose a unique password you have not used before.',
                },
                {
                  icon: <FiLock size={16} className="text-violet-400" />,
                  title: 'Single-use token',
                  body: 'Your reset token expires after use for your security.',
                },
                {
                  icon: <FiCheck size={16} className="text-violet-400" />,
                  title: 'Instant access',
                  body: 'Log in immediately after resetting your password.',
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

            <div className="relative">
              <div className="border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/60 backdrop-blur rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Reset password
                    </h2>
                    <p className="mt-1 text-xs text-zinc-400">
                      Enter your token and a new password.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-zinc-300">
                    Secure
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="relative">
                    <Input
                      label="Reset Token"
                      type="text"
                      name="token"
                      placeholder="Paste reset token here"
                      register={register}
                      errors={errors}
                      options={{
                        required: defaultToken
                          ? false
                          : 'Reset token is required',
                      }}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2.5 pl-11 text-sm text-white placeholder:text-zinc-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition"
                    />
                    <MdOutlineLockOpen
                      size={18}
                      className="absolute left-3 top-[2.65rem] text-zinc-500 pointer-events-none"
                    />
                  </div>

                  <div className="relative">
                    <Input
                      label="New Password"
                      type="password"
                      name="newPassword"
                      placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                      register={register}
                      errors={errors}
                      options={{
                        required: 'Password is required',
                        pattern: {
                          value: PASSWORD_REGEX,
                          message:
                            'Password must be at least 8 characters with a number and special character',
                        },
                      }}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2.5 pl-11 text-sm text-white placeholder:text-zinc-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition"
                    />
                    <IoLockClosedOutline
                      size={18}
                      className="absolute left-3 top-[2.65rem] text-zinc-500 pointer-events-none"
                    />
                  </div>

                  <div className="relative">
                    <Input
                      label="Confirm Password"
                      type="password"
                      name="confirmPassword"
                      placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                      register={register}
                      errors={errors}
                      options={{
                        required: 'Confirm password is required',
                        validate: (value: string) =>
                          value === watch('newPassword') ||
                          'Passwords do not match',
                      }}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2.5 pl-11 text-sm text-white placeholder:text-zinc-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition"
                    />
                    <IoLockClosedOutline
                      size={18}
                      className="absolute left-3 top-[2.65rem] text-zinc-500 pointer-events-none"
                    />
                  </div>

                  {status && (
                    <div
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                        isSuccess
                          ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
                          : 'border-red-500/30 bg-red-500/10 text-red-400'
                      }`}
                    >
                      {isSuccess ? (
                        <span className="text-lg">✓</span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      )}
                      <span>{status}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    text={isSubmitting ? 'Submitting...' : 'Reset Password'}
                    className="w-full rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition hover:from-violet-400 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || isSuccess}
                  />
                </form>
              </div>

              <div className="text-center mt-5">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition"
                >
                  <MdArrowBack size={15} />
                  Back to Login
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
