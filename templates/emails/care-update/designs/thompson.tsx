import type { ComponentProps } from "react";
import { Column, List, ListItem, Text } from "@hyper-elements/react";
import CareUpdate from "../template";
import care from "../../../../families/thompson.care.json";

export const meta = { label: "Dad, a Monday with Sarah" };

export default function Thompson() {
  return (
    <CareUpdate
      {...(care as unknown as ComponentProps<typeof CareUpdate>)}
      from="Sarah"
      careUrl="https://kin.family/thompson"
      log={[
        { type: "reading", what: "bp", value: "126/78", when: "Before breakfast" },
        { type: "reading", what: "sugar", value: "8.4", when: "Before lunch", watch: true },
        { type: "mood", how: "good", text: "Walked to the end of the road and back twice. Grumbled about the hospital food, so he's feeling better." },
      ]}
      word={
        <Column>
          <Text>The clopidogrel runs out on Saturday and he must not miss a day of it. I've ordered it, but someone needs to collect it.</Text>
          <List>
            <ListItem>Mark: can you pick it up on Thursday from Gloucester Road?</ListItem>
            <ListItem>His sugar was high before lunch. He'd had two biscuits with the nurse, so let's see tomorrow.</ListItem>
          </List>
        </Column>
      }
    />
  );
}
