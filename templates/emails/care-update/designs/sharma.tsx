import type { ComponentProps } from "react";
import { Column, Link, List, ListItem, Text } from "@hyper-elements/react";
import CareUpdate from "../template";
import care from "../../../../families/sharma.care.json";

export const meta = { label: "Amma, a Monday with Priya" };

export default function Sharma() {
  return (
    <CareUpdate
      {...(care as unknown as ComponentProps<typeof CareUpdate>)}
      from="Priya"
      careUrl="https://kin.family/sharma"
      log={[
        { type: "reading", what: "bp", value: "138/84", when: "Before breakfast" },
        { type: "reading", what: "sugar", value: "7.9", when: "Before lunch", watch: true },
        { type: "mood", how: "good", text: "Walked to the temple and back. Ate all her lunch." },
      ]}
      word={
        <Column>
          <Text>She asked twice whether the pink tablet is the new one. It's the same tablet, a stronger dose: I've put the new chart on the fridge.</Text>
          <List>
            <ListItem>Arjun: the eye screening on Thursday needs drops, so she can't take the bus home.</ListItem>
            <ListItem>Meera: she'd love the photos from Diwali printed for Sunday.</ListItem>
          </List>
        </Column>
      }
    />
  );
}
