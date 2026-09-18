import { getMe } from "@/lib/graphql/fetchers";
import ChangePasswordForm from "@/components/forms/ChangePasswordForm";
import NotificationPreferencesForm from "@/components/forms/NotificationPreferencesForm";

const SettingsPage = async () => {
  const me = await getMe();

  if (!me) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <p className="text-sm text-gray-500">Could not load your account. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 max-w-2xl flex flex-col gap-10">
      <h1 className="text-lg font-semibold">Account Settings</h1>
      <NotificationPreferencesForm initialEmailNotifications={me.emailNotifications} />
      <hr />
      <ChangePasswordForm />
    </div>
  );
};

export default SettingsPage;