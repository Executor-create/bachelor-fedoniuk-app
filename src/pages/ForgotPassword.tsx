import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { forgotPassword } from '../api/auth';
import { LuGamepad2 } from 'react-icons/lu';
import { MdOutlineMail } from 'react-icons/md';

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
          'If a user with that email exists, a reset link is sent.',
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        <Card className="p-6 bg-card border-border border-gray-300">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-[#6366f1] to-[#8b5cf6] rounded-2xl mb-4">
              <LuGamepad2 className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
            <p className="text-sm text-gray-500">
              Enter your email to receive reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="you@example.com"
                register={register}
                errors={errors}
                options={{ required: 'Email is required' }}
                className="pl-10 w-full border rounded-md p-2"
              />
              <MdOutlineMail
                size={20}
                className="absolute left-3 top-10 text-gray-400"
              />
            </div>

            <Button
              type="submit"
              text={isSubmitting ? 'Sending...' : 'Send Reset Link'}
              className="w-full bg-linear-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold py-2 rounded-md"
              disabled={isSubmitting}
            />

            {status && (
              <p className="text-center text-sm text-gray-700">{status}</p>
            )}

            {emailSent && (
              <p className="text-center text-sm text-primary mt-2">
                Link sent. If you already have the token, you can also go to{' '}
                <Link to="/reset-password" className="font-semibold underline">
                  Reset Password
                </Link>
                .
              </p>
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

export default ForgotPasswordPage;
