import type { ComponentProps } from "react";
import { Column, Text } from "@hyper-elements/react";
import CareUpdate from "../template";
import care from "../../../../families/miller.care.json";

export const meta = { label: "Grandma, a Monday with Linda" };

export default function Miller() {
  return (
    <CareUpdate
      {...(care as unknown as ComponentProps<typeof CareUpdate>)}
      from="Linda"
      careUrl="https://kin.family/miller"
      log={[
        { type: "reading", what: "sugar", value: "6.8", when: "Before breakfast" },
        { type: "mood", how: "good", text: "Sang along to the radio while we baked. Called me by my name all day." },
        { type: "note", text: "The 18 units go in at 7 pm now. I've set an alarm on her phone." },
      ]}
      word={
        <Column>
          <Text>Lisinopril runs out this week, and the pharmacy needs two days. Jake, can you pick it up on Wednesday on your way?</Text>
        </Column>
      }
    />
  );
}
