import type { ComponentProps } from "react";
import { Column, List, ListItem, Text } from "@hyper-elements/react";
import CareUpdate from "../template";
import care from "../../../../families/haddad.care.json";

export const meta = { label: "Baba, a Monday with Rania" };

export default function Haddad() {
  return (
    <CareUpdate
      {...(care as unknown as ComponentProps<typeof CareUpdate>)}
      from="Rania"
      careUrl="https://kin.family/haddad"
      log={[
        { type: "reading", what: "weight", value: "78.4", when: "Before breakfast", watch: true },
        { type: "reading", what: "oxygen", value: "94", when: "After the walk" },
        { type: "mood", how: "okay", text: "Tired, and his ankles are still puffy. He watched the football with Sami on the phone." },
      ]}
      word={
        <Column>
          <Text>The weight is up 1.2 kg since Friday. The nurse said to ring if it goes up 2 kg in three days, so please weigh him first thing tomorrow, before tea.</Text>
          <List>
            <ListItem>Sami: Wednesday's nurse visit is at 09:15, and she wants to see the weight diary.</ListItem>
          </List>
        </Column>
      }
    />
  );
}
