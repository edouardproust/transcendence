import { userService } from '@/services/userService';
import { validateEmail, validateUsername } from '@/features/auth/authConstraints';
import { getApiErrorMessage } from '@/utils/apiError';
import { pushToast } from '@/components/ui/ToastProvider';
import { UserProfile } from '@/types/user';

export interface EditProfileData {
  username: string;
  email: string;
}

export interface EditProfileErrors {
  username?: string;
  email?: string;
}

export const validateEditProfile = (data: EditProfileData): EditProfileErrors => {
  return {
    username: validateUsername(data.username) ?? undefined,
    email: validateEmail(data.email) ?? undefined,
  };
};

export const hasValidationErrors = (errors: EditProfileErrors): boolean => {
  return !!(errors.username || errors.email);
};

export const updateProfileRequest = async (data: {
  username: string;
  email: string;
}): Promise<UserProfile> => {
  return userService.updateProfile(data);
};

export const handleProfileUpdate = async (
  editData: EditProfileData,
  setProfile: (profile: UserProfile | null) => void,
  setEditErrors: (errors: EditProfileErrors) => void,
  setIsEditing: (editing: boolean) => void,
): Promise<boolean> => {
  const errors = validateEditProfile(editData);

  if (hasValidationErrors(errors)) {
    setEditErrors(errors);
    return false;
  }

  try {
    const updated = await updateProfileRequest({
      username: editData.username.trim(),
      email: editData.email.trim(),
    });
    setProfile(updated);
    setEditErrors({});
    setIsEditing(false);
    pushToast('Perfil actualizado exitosamente', 'success');
    return true;
  } catch (error: any) {
    pushToast(getApiErrorMessage(error, 'Error actualizando perfil'), 'error');
    return false;
  }
};

export const uploadAvatarRequest = async (file: File): Promise<{ avatar_url: string }> => {
  return userService.uploadAvatar(file);
};

export const handleAvatarUpload = async (
  file: File,
  setProfile: (updater: (prev: UserProfile | null) => UserProfile | null) => void,
): Promise<boolean> => {
  try {
    const result = await uploadAvatarRequest(file);
    setProfile((prev) =>
      prev ? { ...prev, avatar_url: result.avatar_url } : prev,
    );
    pushToast('Avatar actualizado', 'success');
    return true;
  } catch (error: any) {
    pushToast(getApiErrorMessage(error, 'Error subiendo avatar'), 'error');
    return false;
  }
};
