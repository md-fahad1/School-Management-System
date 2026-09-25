"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

type Props = {
  tKey: string;
  as?: React.ElementType;
  className?: string;
};

const TranslatedText = ({ tKey, as: Tag = "span", className }: Props) => {
  const { t } = useTranslation();
  return <Tag className={className}>{t(tKey)}</Tag>;
};

export default TranslatedText;