"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

const MenuSectionTitle = ({ titleKey }: { titleKey: string }) => {
  const { t } = useTranslation();

  return (
    <span className="hidden lg:block text-sidebarSectionLabel text-xs font-semibold tracking-wider uppercase my-4">
      {t(`menu.${titleKey}`)}
    </span>
  );
};

export default MenuSectionTitle;