import { FieldError } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  inputProps,
}: InputFieldProps) => {
  return (
       <div className="flex flex-col gap-2 w-full sm:w-1/2 md:w-1/4">
      <label className="text-xs text-textSecondary">{label}</label>
      <input
        type={type}
        {...register(name)}
        className="border border-border focus:border-accent focus:ring-2 focus:ring-accentLight p-2.5 rounded-lg text-sm w-full outline-none transition-colors"
        {...inputProps}
        defaultValue={defaultValue}
      />
      {error?.message && (
        <p className="text-xs text-danger">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
