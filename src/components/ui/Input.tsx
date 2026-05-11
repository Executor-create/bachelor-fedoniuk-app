import type { UseFormRegister, FieldErrors } from 'react-hook-form';

type InputProps = {
  className?: string;
  style?: React.CSSProperties;
  type?: string;
  label?: string;
  placeholder?: string;
  name: string;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  options?: Record<string, unknown>;
};

const Input = ({
  className,
  style,
  type,
  label,
  placeholder,
  name,
  register,
  errors,
  options,
}: InputProps) => {
  return label ? (
    <label className="flex flex-col gap-2">
      <span className="font-medium text-sm">{label}</span>
      <input
        type={type}
        className={className}
        style={style}
        placeholder={placeholder}
        {...register(name, options)}
        aria-invalid={errors[name] ? 'true' : 'false'}
      />
      {errors[name] && (
        <span role="alert" className="text-red-500 text-sm mt-1 font-google">
          {String(errors[name]?.message)}
        </span>
      )}
    </label>
  ) : (
    <input
      type={type}
      className={className}
      style={style}
      placeholder={placeholder}
      {...register(name, options)}
      aria-invalid={errors[name] ? 'true' : 'false'}
    />
  );
};

export default Input;
