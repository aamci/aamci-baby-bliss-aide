import cguContent from "@/content/cgu.md?raw";
import LegalDocument from "@/components/legal/LegalDocument";
import { CGU_VERSION, LEGAL_EFFECTIVE_DATE } from "@/lib/legal";

const Cgu = () => (
  <LegalDocument
    title="Conditions Générales d'Utilisation"
    subtitle={`Version ${CGU_VERSION} · En vigueur au ${LEGAL_EFFECTIVE_DATE}`}
    markdown={cguContent}
  />
);

export default Cgu;