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
        if (emailInvalid && passwordInvalid) {
          setError('email', {
            type: 'server',
            message: 'Invalid email or password',
          });
          setError('password', {
            type: 'server',
            message: 'Invalid email or password',
          });
        }
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-center items-center min-h-screen">
        <LuGamepad2
          size={80}
          className={`text-white rounded-3xl p-5 mb-4 ${!isLogin ? 'mt-10' : ''}`}
          style={{
            background:
              'linear-gradient(to bottom right, var(--primary-color), var(--secondary-color))',
          }}
        />
        <h1
          className="text-4xl mb-3 font-google font-bold"
          style={{
            background:
              'linear-gradient(to bottom right, var(--primary-color), var(--secondary-color))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Klyro
        </h1>
        <p className="text-lg text-gray-500 font-google">
          Your gaming social network
        </p>
        {successMessage && (
          <div className="w-full max-w-md mb-1 mt-3 flex justify-center">
            <div className="flex items-center gap-3 bg-linear-to-r from-green-400 to-emerald-500 border-0 shadow-lg px-6 py-4 rounded-xl text-white text-lg font-semibold font-google animate-fade-in">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{successMessage}</span>
            </div>
          </div>
        )}
        <form
          onSubmit={handleSubmit(isLogin ? handleLogin : handleSignUp)}
          className="w-full max-w-md"
        >
          <Card className="w-105 mt-8 p-6 shadow-lg border border-gray-300">
            <div className="flex p-1 mb-1 bg-gray-200 rounded-2xl">
              <Button
                className={`${
                  isLogin
                    ? 'bg-white text-black font-bold rounded-2xl p-1 w-full cursor-pointer font-google'
                    : 'bg-transparent text-black font-bold rounded-2xl p-1 w-full focus:bg-white cursor-pointer font-google'
                }`}
                text="Login"
                type="button"
                onClick={() => setIsLogin(true)}
              />
              <Button
                className={`${
                  !isLogin
                    ? 'bg-white text-black font-bold rounded-2xl p-1 w-full cursor-pointer font-google'
                    : 'bg-transparent text-black font-bold rounded-2xl p-1 w-full focus:bg-white cursor-pointer font-google'
                }`}
                text="Sign Up"
                type="button"
                onClick={() => setIsLogin(false)}
              />
            </div>
            {!isLogin && (
              <div className="relative">
                <Input
                  className="pl-10 bg-secondary border border-gray-300 rounded-md p-1 bg-gray-100 font-google"
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
                  size={20}
                  className="absolute left-3 top-8.5 text-gray-500 pointer-events-none"
                />
              </div>
            )}
            <div className="relative">
              <Input
                className="pl-10 bg-secondary border border-gray-300 rounded-md p-1 bg-gray-100 font-google"
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
                size={20}
                className="absolute left-3 top-8.5 text-gray-500 pointer-events-none"
              />
            </div>

            <div className="relative">
              <Input
                className="pl-10 bg-secondary border border-gray-300 rounded-md p-1 bg-gray-100 font-google"
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
                size={20}
                className="absolute left-3 top-8.5 text-gray-500 pointer-events-none"
              />
              {showPassword ? (
                <FiEyeOff
                  size={20}
                  className="absolute right-3 top-8.5 text-gray-400 cursor-pointer"
                  onClick={togglePasswordVisibility}
                />
              ) : (
                <MdOutlineRemoveRedEye
                  size={20}
                  className="absolute right-3 top-8.5 text-gray-400 cursor-pointer"
                  onClick={togglePasswordVisibility}
                />
              )}
            </div>

            {!isLogin && (
              <div className="relative">
                <Input
                  className="pl-10 bg-secondary border border-gray-300 rounded-md p-1 bg-gray-100 font-google"
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={'•••••••••'}
                  name="confirmPassword"
                  register={register}
                  errors={errors}
                  options={{
                    required: 'Confirm password is required',
                    validate: (value: string) =>
                      value === watch('password') || 'Passwords do not match',
                  }}
                />
                <IoLockClosedOutline
                  size={20}
                  className="absolute left-3 top-8.5 text-gray-500 pointer-events-none"
                />
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary font-semibold hover:underline font-google"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <Button
              className="bg-black rounded-lg p-1.5 w-full text-white hover:bg-primary cursor-pointer font-google"
              text={isLogin ? 'Login' : 'Sign Up'}
              type="submit"
            />
          </Card>
        </form>
        <p
          className={`text-sm text-center text-gray-500 mt-8 font-google ${!isLogin ? 'mb-4' : ''}`}
        >
          By continuing, you agree to our{' '}
          <span className="cursor-pointer font-bold text-black text-[1.1em]">
            Terms of Service
          </span>{' '}
          and{' '}
          <span className="cursor-pointer font-bold text-black text-[1.1em]">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
