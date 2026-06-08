import LegalDocument from "@/components/legal/LegalDocument";

const MentionsLegales = () => (
  <LegalDocument title="Mentions légales" subtitle="Informations éditeur & hébergeur">
    <h2>1. Éditeur de l'application</h2>
    <p>
      L'application <strong>BébéSanté</strong> est éditée par la société{" "}
      <strong>[NOM_SOCIETE]</strong>, [FORME_JURIDIQUE] au capital social de [MONTANT] €,
      immatriculée au Registre du Commerce et des Sociétés de [VILLE] sous le numéro{" "}
      [NUMERO_RCS], dont le siège social est situé [ADRESSE_COMPLETE].
    </p>
    <ul>
      <li>SIRET : [NUMERO_SIRET]</li>
      <li>Code APE/NAF : [CODE_APE]</li>
      <li>TVA intracommunautaire : [NUMERO_TVA]</li>
      <li>Téléphone : [NUMERO_TELEPHONE]</li>
      <li>Email : [EMAIL_CONTACT]</li>
    </ul>

    <h2>2. Directeur de la publication</h2>
    <p>
      Le directeur de la publication est <strong>[NOM_DIRECTEUR_PUBLICATION]</strong>, en sa
      qualité de [QUALITE_DIRECTEUR].
    </p>

    <h2>3. Délégué à la Protection des Données (DPO)</h2>
    <p>
      Conformément au RGPD, un DPO est désigné. Il peut être contacté à l'adresse :{" "}
      <a href="mailto:[EMAIL_DPO]">[EMAIL_DPO]</a> ou par courrier à l'adresse du siège social,
      mention « À l'attention du DPO ».
    </p>

    <h2>4. Hébergeur des données de santé (HDS)</h2>
    <p>
      Les données de santé à caractère personnel collectées par BébéSanté sont hébergées par un
      hébergeur certifié <strong>Hébergeur de Données de Santé (HDS)</strong> conformément à
      l'article L.1111-8 du Code de la santé publique :
    </p>
    <ul>
      <li><strong>OVHcloud SAS</strong></li>
      <li>2 rue Kellermann — 59100 Roubaix — France</li>
      <li>Téléphone : 1007</li>
      <li>Site : <a href="https://www.ovhcloud.com" target="_blank" rel="noopener">www.ovhcloud.com</a></li>
      <li>Numéro de certification HDS : [NUMERO_HDS]</li>
    </ul>

    <h2>5. Hébergeur de l'application</h2>
    <p>
      L'application web et son backend technique sont opérés sur l'infrastructure{" "}
      <strong>Supabase</strong> (Supabase Inc., 970 Toa Payoh North #07-04, Singapore 318992),
      avec stockage de données dans la région Union européenne, et déployés via{" "}
      <strong>Lovable</strong> pour la partie frontale.
    </p>

    <h2>6. Propriété intellectuelle</h2>
    <p>
      L'ensemble des contenus de l'Application (textes, graphismes, logo, icônes, images,
      vidéos, sons, ainsi que leur mise en forme) sont la propriété exclusive de [NOM_SOCIETE]
      ou font l'objet d'une autorisation d'utilisation. Toute reproduction, représentation,
      modification ou exploitation, totale ou partielle, est interdite sans autorisation
      préalable écrite.
    </p>

    <h2>7. Médiation de la consommation</h2>
    <p>
      Conformément aux articles L.611-1 et suivants du Code de la consommation, l'utilisateur
      consommateur peut recourir gratuitement au service de médiation :{" "}
      <strong>[NOM_MEDIATEUR]</strong> — [ADRESSE_MEDIATEUR] —{" "}
      <a href="[URL_MEDIATEUR]" target="_blank" rel="noopener">[URL_MEDIATEUR]</a>.
    </p>

    <h2>8. Signalement de contenus illicites (DSA)</h2>
    <p>
      Conformément au Règlement (UE) 2022/2065 (Digital Services Act), tout signalement de
      contenu illicite peut être adressé à <a href="mailto:[EMAIL_CONTACT]">[EMAIL_CONTACT]</a>.
    </p>

    <h2>9. Crédits</h2>
    <p>
      Icônes : Lucide (ISC License). Polices : Inter (SIL Open Font License). Sources médicales
      : HAS, Santé publique France, OMS, Société Française de Pédiatrie.
    </p>
  </LegalDocument>
);

export default MentionsLegales;