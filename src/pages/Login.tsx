import { LuGamepad2 } from 'react-icons/lu';
import { Card } from '../components/ui/Card';
import { IoLockClosedOutline } from 'react-icons/io5';
import Input from '../components/ui/Input';
import { useForm, type SubmitHandler } from 'react-hook-form';
import Button from '../components/ui/Button';
import {
  MdOutlineMail,
  MdOutlineRemoveRedEye,
  MdOutlinePerson,
} from 'react-icons/md';
import { FiEyeOff } from 'react-icons/fi';
import { useState } from 'react';
import { EMAIL_REGEX, PASSWORD_REGEX } from '../utils/regex';
import {
  login,
  signUp,
  type LoginRequest,
  type LoginResponse,
  type SignUpRequest,
  type SignUpResponse,
} from '../api/auth';
import { setItemToLocalStorage } from '../utils/localStorage';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<any>();
  const { refreshUser } = useAuth();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const navigate = useNavigate();

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  const handleSignUp: SubmitHandler<SignUpRequest> = async (
    data: SignUpRequest,
  ): Promise<SignUpResponse | undefined> => {
    try {
      const response = await signUp(data);

      if (response && response.userId) {
        setItemToLocalStorage('userId', response.userId);
        reset();
        navigate('/otp', { state: { userId: response.userId } });
      }
      return response;
    } catch (error: any) {
      reset(undefined, { keepValues: true });

      if (error?.field && error?.message) {
        setError(error.field, { type: 'server', message: error.message });
      } else if (error?.message) {
        const message = error.message.toLowerCase();

        if (message.includes('username') && message.includes('email')) {
          setError('username', {
            type: 'server',
            message: 'Username or email already exists',
          });
          setError('email', {
            type: 'server',
            message: 'Username or email already exists',
          });
        } else if (message.includes('username')) {
          setError('username', { type: 'server', message: error.message });
        } else if (message.includes('email')) {
          setError('email', { type: 'server', message: error.message });
        } else {
          setError('root', { type: 'server', message: error.message });
        }
      } else if (error instanceof Error) {
        setError('root', { type: 'server', message: error.message });
      } else {
        setError('root', {
          type: 'server',
          message: 'An unknown error occurred',
        });
      }
    }
  };

  const handleLogin: SubmitHandler<LoginRequest> = async (
    data: LoginRequest,
  ): Promise<LoginResponse | undefined> => {
    try {
      const response = await login(data);

      setItemToLocalStorage('token', response?.accessToken || '');
      if (response?.refreshToken) {
        setItemToLocalStorage('refreshToken', response.refreshToken);
      }

      await refreshUser();

      setSuccessMessage('Login successful! Redirecting to home...');
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/');
      }, 1500);
      return response;
    } catch (error: any) {
      reset(undefined, { keepValues: true });

      if (error?.message) {
        const message = error.message.toLowerCase();
        const emailInvalid = message.includes('email');
        const passwordInvalid = message.includes('password');
        if (emailInvalid || passwordInvalid) {
          setError('email', {
            type: 'server',
            message: error.message,
          });
          setError('password', {
            type: 'server',
            message: error.message,
          });
        } else {
          setError('root', { type: 'server', message: error.message });
        }
      } else {
        setError('root', {
          type: 'server',
          message: 'An unexpected error occurred. Please try again.',
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <div className="absolute -top-40 right-0 h-105 w-105 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35),rgba(99,102,241,0))] blur-3xl" />
      <div className="absolute -bottom-48 left-0 h-105 w-105 rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.35),rgba(139,92,246,0))] blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,15,23,0.7),rgba(9,9,12,0.95))]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12 lg:py-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              <LuGamepad2 className="text-violet-300" size={18} />
              <span className="font-google">Klyro access</span>
            </div>

            <h1 className="font-google text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Sign in to your gaming universe
            </h1>
            <p className="max-w-xl text-base leading-7 text-zinc-400">
              Build collections, follow friends, and unlock smart
              recommendations tailored to your play style.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'Curated collections',
                  body: 'Organize every game into beautiful shelves.',
                },
                {
                  title: 'Recommendations',
                  body: 'Discover new titles with confidence scoring.',
                },
                {
                  title: 'Community reviews',
                  body: 'Share reactions and follow creators you trust.',
                },
                {
                  title: 'Premium upgrades',
                  body: 'Unlock unlimited lists and profile perks.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <h3 className="text-sm font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-zinc-400">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="relative">
            <div className="absolute -inset-1 rounded-4xl bg-linear-to-br from-violet-500/20 via-transparent to-violet-500/10 blur-xl" />

            <form
              onSubmit={handleSubmit(isLogin ? handleLogin : handleSignUp)}
              className="relative"
            >
              <Card className="border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/60 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {isLogin ? 'Welcome back' : 'Create your account'}
                    </h2>
                    <p className="mt-1 text-xs text-zinc-400">
                      {isLogin
                        ? 'Sign in to continue your journey.'
                        : 'Start building your Klyro profile.'}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-zinc-300">
                    Secure
                  </div>
                </div>

                {successMessage && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    <span className="text-lg">✓</span>
                    <span>{successMessage}</span>
                  </div>
                )}

                {errors.root?.message && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    <span>{errors.root.message}</span>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-2 rounded-full bg-white/5 p-1">
                  <Button
                    className={`${
                      isLogin
                        ? 'rounded-full bg-white/10 text-white'
                        : 'rounded-full text-zinc-400'
                    } px-4 py-2 text-xs font-semibold transition`}
                    text="Login"
                    type="button"
                    onClick={() => setIsLogin(true)}
                  />
                  <Button
                    className={`${
                      !isLogin
                        ? 'rounded-full bg-white/10 text-white'
                        : 'rounded-full text-zinc-400'
                    } px-4 py-2 text-xs font-semibold transition`}
                    text="Sign Up"
                    type="button"
                    onClick={() => setIsLogin(false)}
                  />
                </div>

                <div className="mt-6 space-y-4">
                  {!isLogin && (
                    <div className="relative">
                      <Input
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2.5 pl-11 text-sm text-white placeholder:text-zinc-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition font-google"
                        label="Username"
                        type="text"
                        placeholder="yourusername"
                        name="username"
                        register={register}
                        errors={errors}
                        options={{
                          required: 'Username is required',
                        }}
                      />
                      <MdOutlinePerson
                        size={18}
                        className="absolute left-3 top-[2.65rem] text-zinc-500 pointer-events-none"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Input
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2.5 pl-11 text-sm text-white placeholder:text-zinc-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition font-google"
                      label="Email"
                      type="email"
                      placeholder="your@email.com"
                      name="email"
                      register={register}
                      errors={errors}
                      options={{
                        required: 'Email is required',
                        pattern: {
                          value: EMAIL_REGEX,
                          message: 'Invalid email address',
                        },
                      }}
                    />
                    <MdOutlineMail
                      size={18}
                      className="absolute left-3 top-[2.65rem] text-zinc-500 pointer-events-none"
                    />
                  </div>

                  <div className="relative">
                    <Input
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2.5 pl-11 pr-11 text-sm text-white placeholder:text-zinc-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition font-google"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={'•••••••••'}
                      name="password"
                      register={register}
                      errors={errors}
                      options={{
                        required: 'Password is required',
                        pattern: {
                          value: PASSWORD_REGEX,
                          message: 'Invalid password',
                        },
                      }}
                    />
                    <IoLockClosedOutline
                      size={18}
                      className="absolute left-3 top-[2.65rem] text-zinc-500 pointer-events-none"
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-[2.55rem] text-zinc-400 hover:text-white"
                    >
                      {showPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <MdOutlineRemoveRedEye size={18} />
                      )}
                    </button>
                  </div>

                  {!isLogin && (
                    <div className="relative">
                      <Input
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2.5 pl-11 text-sm text-white placeholder:text-zinc-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition font-google"
                        label="Confirm Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={'•••••••••'}
                        name="confirmPassword"
                        register={register}
                        errors={errors}
                        options={{
                          required: 'Confirm password is required',
                          validate: (value: string) =>
                            value === watch('password') ||
                            'Passwords do not match',
                        }}
                      />
                      <IoLockClosedOutline
                        size={18}
                        className="absolute left-3 top-[2.65rem] text-zinc-500 pointer-events-none"
                      />
                    </div>
                  )}

                  {isLogin && (
                    <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-xs font-semibold text-violet-300 hover:text-violet-200"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  <Button
                    className="w-full rounded-xl bg-linear-to-r from-violet-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition hover:from-violet-400 hover:to-indigo-400"
                    text={isLogin ? 'Login' : 'Sign Up'}
                    type="submit"
                  />
                </div>

                <p className="mt-6 text-xs text-zinc-400">
                  By continuing, you agree to our{' '}
                  <span className="font-semibold text-white">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="font-semibold text-white">
                    Privacy Policy
                  </span>
                  .
                </p>
              </Card>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;
