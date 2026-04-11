import { AUTH_CONSTRAINTS } from '@/features/auth/authConstraints';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface EditProfileFormProps {
  editData: { username: string; email: string };
  editErrors: { username?: string; email?: string };
  onChange: (field: 'username' | 'email', value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  editData,
  editErrors,
  onChange,
  onSave,
  onCancel,
}) => {
  return (
    <div className="mt-4 space-y-3">
      <Input
        label="Nombre de usuario"
        value={editData.username}
        onChange={(e) => onChange('username', e.target.value)}
        minLength={AUTH_CONSTRAINTS.username.minLength}
        maxLength={AUTH_CONSTRAINTS.username.maxLength}
        error={editErrors.username}
      />
      <Input
        label="Email"
        type="email"
        value={editData.email}
        onChange={(e) => onChange('email', e.target.value)}
        error={editErrors.email}
      />
      <div className="flex gap-2">
        <Button onClick={onSave}>Guardar</Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};
