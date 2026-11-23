import type { ComponentProps } from "react";
import { Column, Text } from "@hyper-elements/react";
import CareUpdate from "../template";
import care from "../../../../families/morales.care.json";

export const meta = { label: "Abuela, a Monday with Lucía" };

export default function Morales() {
  return (
    <CareUpdate
      {...(care as unknown as ComponentProps<typeof CareUpdate>)}
      from="Lucía"
      careUrl="https://kin.family/morales"
      log={[
        { type: "reading", what: "sugar", value: "6.8", when: "Before breakfast" },
        { type: "mood", how: "good", text: "Sang along to the radio while we made tamales. Called me by my name all day." },
        { type: "note", text: "The 18 units are going in at 7 pm now: I've set an alarm on her phone that says it in Spanish." },
      ]}
      word={
        <Column>
          <Text>Lisinopril runs out this week, and the pharmacy needs two days. Diego, can you pick it up on Wednesday on your way?</Text>
        </Column>
      }
    />
  );
}
