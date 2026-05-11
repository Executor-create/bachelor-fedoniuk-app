import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { resetPassword } from '../api/auth';
import { LuGamepad2 } from 'react-icons/lu';
import { MdOutlineLockOpen } from 'react-icons/md';

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

      if (response.message) {
        setStatus('Password reset successful. Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setStatus('Unable to reset password. Try again.');
      }
    } catch (error: any) {
      setStatus(
        error?.message || 'Unable to reset password. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="p-6 bg-card border-border border-gray-300">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-[#6366f1] to-[#8b5cf6] rounded-2xl mb-4">
              <LuGamepad2 className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
            <p className="text-sm text-gray-500">
              Enter your reset token and new password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Input
                label="Reset Token"
                type="text"
                name="token"
                placeholder="paste reset token here"
                register={register}
                errors={errors}
                options={{ required: 'Reset token is required' }}
                className="pl-10 w-full border rounded-md p-2"
              />
              <MdOutlineLockOpen
                size={20}
                className="absolute left-3 top-10 text-gray-400"
              />
            </div>

            <div className="relative">
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                placeholder="•••••••••"
                register={register}
                errors={errors}
                options={{
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                }}
                className="pl-10 w-full border rounded-md p-2"
              />
              <MdOutlineLockOpen
                size={20}
                className="absolute left-3 top-10 text-gray-400"
              />
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                placeholder="•••••••••"
                register={register}
                errors={errors}
                options={{
                  required: 'Confirm password is required',
                  validate: (value: string) =>
                    value === watch('newPassword') || 'Passwords do not match',
                }}
                className="pl-10 w-full border rounded-md p-2"
              />
              <MdOutlineLockOpen
                size={20}
                className="absolute left-3 top-10 text-gray-400"
              />
            </div>

            <Button
              type="submit"
              text={isSubmitting ? 'Submitting...' : 'Reset Password'}
              className="w-full bg-linear-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold py-2 rounded-md"
              disabled={isSubmitting}
            />

            {status && (
              <p className="text-center text-sm text-red-500">{status}</p>
            )}

            <p className="text-center text-sm">
              Remembered password?{' '}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
