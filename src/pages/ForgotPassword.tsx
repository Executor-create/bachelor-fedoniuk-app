import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { forgotPassword } from '../api/auth';
import { LuGamepad2 } from 'react-icons/lu';
import { MdOutlineMail, MdArrowBack } from 'react-icons/md';
import { FiMail, FiShield, FiClock, FiCheck } from 'react-icons/fi';
import { EMAIL_REGEX } from '../utils/regex';

type ForgotPasswordFormValues = {
  email: string;
};

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ mode: 'onTouched' });

  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async (data) => {
    setStatus('');
    setIsSubmitting(true);

    try {
      const response = await forgotPassword(data.email);
      setStatus(
        response.message ||
          'If a user with that email exists, a reset link has been sent.',
      );
      setEmailSent(true);
    } catch (error: any) {
      setStatus(error?.message || 'Unable to send reset link at this time.');
      setEmailSent(false);
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
              Reset your password
            </h1>
            <p className="max-w-xl text-base leading-7 text-zinc-400">
              Enter your email address and we'll send you a link to reset your
              password and get back into your account.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: <FiMail size={16} className="text-violet-400" />,
                  title: 'Check your inbox',
                  body: "We'll send a reset link to the email on your account.",
                },
                {
                  icon: <FiShield size={16} className="text-violet-400" />,
                  title: 'Secure reset',
                  body: 'Reset links are single-use and expire after 15 minutes.',
                },
                {
                  icon: <FiClock size={16} className="text-violet-400" />,
                  title: 'Quick process',
                  body: 'Follow the link in the email to choose a new password.',
                },
                {
                  icon: <FiCheck size={16} className="text-violet-400" />,
                  title: 'Back in seconds',
                  body: 'Once reset, log in immediately with your new password.',
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
                      Forgot password
                    </h2>
                    <p className="mt-1 text-xs text-zinc-400">
                      Enter your email to receive reset instructions.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-zinc-300">
                    Secure
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="relative">
                    <Input
                      label="Email"
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      register={register}
                      errors={errors}
                      options={{
                        required: 'Email is required',
                        pattern: {
                          value: EMAIL_REGEX,
                          message: 'Invalid email address',
                        },
                      }}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2.5 pl-11 text-sm text-white placeholder:text-zinc-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition"
                    />
                    <MdOutlineMail
                      size={18}
                      className="absolute left-3 top-[2.65rem] text-zinc-500 pointer-events-none"
                    />
                  </div>

                  {status && (
                    <div
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                        emailSent
                          ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
                          : 'border-red-500/30 bg-red-500/10 text-red-400'
                      }`}
                    >
                      {emailSent ? (
                        <span className="text-lg">✓</span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      )}
                      <span>{status}</span>
                    </div>
                  )}

                  {emailSent && (
                    <p className="text-center text-xs text-zinc-400">
                      Already have the token?{' '}
                      <Link
                        to="/reset-password"
                        className="font-semibold text-violet-300 hover:text-violet-200"
                      >
                        Reset Password
                      </Link>
                    </p>
                  )}

                  <Button
                    type="submit"
                    text={isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    className="w-full rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition hover:from-violet-400 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
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

export default ForgotPasswordPage;
