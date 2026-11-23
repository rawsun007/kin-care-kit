/** The site's 404 page: a Hyper Elements Page, like the landing page. */
import { Button, Heading, Page, Section, Text, token } from "@hyper-elements/react";
import { brand } from "../templates/_brands/kin";
import { Mark } from "../templates/_care/parts";

const colors = brand.theme.colors as Record<string, string>;

export default function NotFound({ home }: { home: string }) {
  return (
    <Page width={720} lang="en" title="Page not found · Kin care kit" description="This page isn't part of the Kin care kit." theme={brand.theme} fonts={brand.fonts} style={{ backgroundColor: token("colors.background"), color: token("colors.foreground"), gap: 0 }}>
      <Section style={{ padding: [96, 32], gap: 20, alignItems: "center", mobile: { padding: [56, 16] } }}>
        <Mark size={56} color={colors.primary!} accent={colors.accent!} />
        <Heading level={1} style={{ textAlign: "center" }}>
          {"This page isn't in the kit"}
        </Heading>
        <Text style={{ textAlign: "center", color: token("colors.muted") }}>The link may be old: the examples are rebuilt whenever a care file changes.</Text>
        <Button href={home} style={{ fontSize: 18, padding: [14, 22], borderRadius: token("radii.sm") }}>
          Back to the kit
        </Button>
      </Section>
    </Page>
  );
}
