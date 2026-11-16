import { InfoSection } from "@/components/info/InfoPageShell";
import { getOperatorDetails } from "@/lib/legal/operator";

/** Sekcja z danymi operatora; renderuje się tylko, gdy dane są ustawione. */
export function OperatorDetails() {
  const operator = getOperatorDetails();
  if (!operator) return null;

  return (
    <InfoSection title="Dane operatora">
      <p>
        {operator.name}
        <br />
        {operator.address}
        <br />
        NIP: {operator.nip}
        <br />
        E-mail:{" "}
        <a
          href={`mailto:${operator.email}`}
          className="font-semibold text-accent hover:underline"
        >
          {operator.email}
        </a>
      </p>
    </InfoSection>
  );
}
