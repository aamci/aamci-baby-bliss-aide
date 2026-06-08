import LegalDocument from "@/components/legal/LegalDocument";
import { PRIVACY_VERSION, LEGAL_EFFECTIVE_DATE } from "@/lib/legal";
import { Link } from "react-router-dom";

const Confidentialite = () => (
  <LegalDocument
    title="Politique de confidentialité"
    subtitle={`Version ${PRIVACY_VERSION} · En vigueur au ${LEGAL_EFFECTIVE_DATE}`}
  >
    <h2>1. Responsable du traitement</h2>
    <p>
      Le responsable des traitements est <strong>[NOM_SOCIETE]</strong>, dont les coordonnées
      figurent dans les <Link to="/legal/mentions-legales">mentions légales</Link>. Le
      Délégué à la Protection des Données est joignable à{" "}
      <a href="mailto:[EMAIL_DPO]">[EMAIL_DPO]</a>.
    </p>

    <h2>2. Cadre juridique</h2>
    <p>
      Les traitements sont opérés conformément au Règlement (UE) 2016/679 (RGPD), à la loi
      n°78-17 « Informatique et Libertés », au Code de la santé publique (notamment article
      L.1111-8 — hébergement de données de santé) et aux référentiels de l'ANS / HDS.
    </p>

    <h2>3. Traitements mis en œuvre</h2>

    <h3>3.1 Création de compte et profil parent</h3>
    <ul>
      <li><strong>Finalité :</strong> identification, authentification, sécurité du compte.</li>
      <li><strong>Données :</strong> nom, prénom, email, téléphone, mot de passe haché.</li>
      <li><strong>Base légale :</strong> exécution du contrat (art. 6.1.b RGPD).</li>
      <li><strong>Durée :</strong> durée du compte + 3 ans à compter de la dernière activité.</li>
    </ul>

    <h3>3.2 Profil enfant & suivi médical</h3>
    <ul>
      <li><strong>Finalité :</strong> suivi de croissance, vaccinations, visites obligatoires.</li>
      <li>
        <strong>Données de santé :</strong> date de naissance, sexe, mesures (poids, taille,
        périmètre crânien), vaccins, antécédents, allergies, traitements.
      </li>
      <li>
        <strong>Base légale :</strong> consentement explicite du titulaire de l'autorité
        parentale (art. 9.2.a RGPD) et intérêt vital de l'enfant (art. 9.2.c).
      </li>
      <li><strong>Durée :</strong> jusqu'aux 18 ans de l'enfant ou suppression du compte.</li>
    </ul>

    <h3>3.3 Assistant IA médical</h3>
    <ul>
      <li>
        <strong>Finalité :</strong> répondre aux questions parentales et pédiatriques par un
        assistant conversationnel basé sur Google Gemini (Lovable AI Gateway).
      </li>
      <li>
        <strong>Données traitées :</strong> contenu des questions, contexte pédiatrique
        (âge, sexe de l'enfant), historique de conversation.
      </li>
      <li>
        <strong>Base légale :</strong> consentement (art. 6.1.a et 9.2.a RGPD).
      </li>
      <li>
        <strong>Sous-traitants :</strong> Google Ireland Ltd (modèle Gemini), via le Lovable AI
        Gateway. Aucune donnée n'est utilisée pour entraîner les modèles.
      </li>
      <li>
        <strong>Transfert hors UE :</strong> traitements opérés au sein de l'EEE ; tout transfert
        éventuel est encadré par les Clauses Contractuelles Types de la Commission européenne.
      </li>
      <li><strong>Durée :</strong> 12 mois pour l'historique, anonymisé au-delà.</li>
    </ul>

    <h3>3.4 Coffre-fort médical (documents)</h3>
    <ul>
      <li>
        <strong>Finalité :</strong> conservation sécurisée et restitution à l'utilisateur des
        documents médicaux relatifs à son enfant.
      </li>
      <li>
        <strong>Données :</strong> fichiers (PDF, images, comptes-rendus), métadonnées
        (catégorie, date), journaux d'audit (upload, téléchargement, suppression).
      </li>
      <li>
        <strong>Mesures de sécurité :</strong> chiffrement au repos (AES-256) et en transit
        (TLS 1.3), URLs signées à durée limitée, hébergement HDS (OVHcloud), Row-Level
        Security au niveau base, contrôle parent-enfant via fonction <code>SECURITY DEFINER</code>.
      </li>
      <li>
        <strong>Base légale :</strong> consentement explicite (art. 9.2.a RGPD).
      </li>
      <li>
        <strong>Durée :</strong> jusqu'à suppression manuelle par l'utilisateur ou clôture du
        compte. Journaux d'audit conservés 3 ans à des fins probatoires (art. L.1111-8).
      </li>
    </ul>

    <h3>3.5 Rappels & notifications push</h3>
    <ul>
      <li>
        <strong>Finalité :</strong> rappels de visites médicales, vaccinations, rendez-vous,
        prises de médicaments.
      </li>
      <li><strong>Données :</strong> identifiant d'abonnement push (VAPID), canal préféré.</li>
      <li>
        <strong>Base légale :</strong> consentement (art. 6.1.a RGPD) révocable à tout moment
        depuis les paramètres.
      </li>
      <li><strong>Durée :</strong> jusqu'au retrait du consentement ou désinscription push.</li>
    </ul>

    <h3>3.6 Co-parentalité</h3>
    <ul>
      <li>
        <strong>Finalité :</strong> partage encadré des informations enfant entre titulaires
        de l'autorité parentale.
      </li>
      <li>
        <strong>Données :</strong> email du co-parent invité, jeton d'invitation, statut.
      </li>
      <li><strong>Base légale :</strong> consentement de l'invitant et de l'invité.</li>
    </ul>

    <h2>4. Destinataires des données</h2>
    <p>
      Les données sont accessibles aux seuls utilisateurs autorisés (le parent, les
      co-parents invités). Côté technique, elles sont traitées par :
    </p>
    <ul>
      <li>OVHcloud (hébergeur HDS) ;</li>
      <li>Supabase Inc. (backend Postgres et stockage) — région UE ;</li>
      <li>Google Ireland Ltd (Gemini via Lovable AI Gateway) pour l'assistant IA ;</li>
      <li>Prestataires d'envoi push/email (le cas échéant) ;</li>
      <li>Autorités administratives ou judiciaires sur réquisition.</li>
    </ul>

    <h2>5. Cookies et traceurs</h2>
    <p>
      L'Application n'utilise que les cookies strictement nécessaires au fonctionnement par
      défaut. Les cookies de mesure d'audience ou fonctionnels ne sont déposés qu'après
      consentement granulaire de l'utilisateur, recueilli via le bandeau cookies conforme à
      la délibération CNIL n°2020-091 et au RGPD. Le consentement est journalisé et peut être
      modifié à tout moment depuis le pied de page « Gérer mes cookies » ou la page profil.
    </p>

    <h2>6. Vos droits</h2>
    <p>
      Conformément aux articles 15 à 22 du RGPD, vous disposez des droits suivants :
    </p>
    <ul>
      <li>droit d'accès et de copie ;</li>
      <li>droit de rectification ;</li>
      <li>droit à l'effacement (« droit à l'oubli ») ;</li>
      <li>droit à la portabilité ;</li>
      <li>droit à la limitation du traitement ;</li>
      <li>droit d'opposition ;</li>
      <li>droit de retirer votre consentement à tout moment ;</li>
      <li>droit de définir des directives post-mortem (art. 85 LIL).</li>
    </ul>
    <p>
      Ces droits s'exercent depuis le{" "}
      <Link to="/legal/rgpd"><strong>Centre RGPD</strong></Link> de l'Application ou par email
      à <a href="mailto:[EMAIL_DPO]">[EMAIL_DPO]</a>. Une preuve d'identité pourra être
      demandée. En cas de réponse insatisfaisante, vous pouvez introduire une réclamation
      auprès de la <strong>CNIL</strong> (
      <a href="https://www.cnil.fr" target="_blank" rel="noopener">www.cnil.fr</a>).
    </p>

    <h2>7. Sécurité</h2>
    <p>
      Mesures techniques et organisationnelles : chiffrement TLS 1.3 / AES-256, RLS Postgres,
      politiques d'accès par rôle, journalisation des accès aux documents médicaux, double
      authentification disponible, sauvegardes chiffrées, audits de sécurité réguliers.
    </p>

    <h2>8. Modifications</h2>
    <p>
      La présente politique peut être mise à jour pour refléter des évolutions légales,
      techniques ou fonctionnelles. Toute modification substantielle fait l'objet d'une
      information préalable et, si nécessaire, d'un nouveau recueil de consentement.
    </p>
  </LegalDocument>
);

export default Confidentialite;