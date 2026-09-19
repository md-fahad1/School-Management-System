import { getMyInstitution } from "@/lib/graphql/fetchers";
import InstitutionSettingsForm from "@/components/forms/InstitutionSettingsForm";

const InstitutionPage = async () => {
  const institution = await getMyInstitution();

  if (!institution) {
    return (
      <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0">
        <p className="text-sm text-textMuted">
          Could not load institution details. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-cardBg border border-border shadow-sm p-4 rounded-2xl flex-1 m-4 mt-0 max-w-2xl">
      <h1 className="text-lg font-semibold text-textPrimary mb-4">Institution Settings</h1>
      <InstitutionSettingsForm initial={institution} />
    </div>
  );
};

export default InstitutionPage;