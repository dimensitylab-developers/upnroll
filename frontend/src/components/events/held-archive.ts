import type { HeldRecordData } from "./held-record";

export const HELD_ARCHIVE: Record<string, HeldRecordData> = {
  "no-gi-12-july-2026": {
    name: "No-Gi Grappling",
    date: "12 July 2026",
    summary: "A No-Gi card. White belts in one division, blue and purple belts in the other. The record below is what was published for that night.",
    photos: [],
    videos: [{ src: "/Videos/IMG_7263.MP4_2.mp4", caption: "12 July 2026" }],
    winners: [],
    divisions: [
      { name: "Beginner", detail: "White belts only." },
      { name: "Advanced", detail: "Blue and purple belts." },
    ],
    rounds: [
      { label: "6:00", detail: "Each match was six minutes." },
      { label: "0:00–3:00", detail: "The first half had no points." },
      { label: "3:00–6:00", detail: "Points counted only in the second half." },
      { label: "Anytime", detail: "A submission counted for the whole match." },
    ],
    scoringNote: "Points counted only in the last three minutes. Back control needed hooks or a body triangle.",
    scoring: [
      { name: "Takedown", points: "2" },
      { name: "Sweep", points: "2" },
      { name: "Knee on belly", points: "2" },
      { name: "Guard pass", points: "3" },
      { name: "Mount", points: "2" },
      { name: "Back control", points: "3" },
    ],
    rules: [
      { title: "Beginner, permitted", lines: ["All standard chokes", "Armbar", "Kimura", "Americana", "Omoplata", "Straight foot lock"] },
      { title: "Beginner, prohibited", lines: ["Heel hooks", "Toe holds", "Knee bars", "Calf slicers", "Flying submissions", "Jumping guard", "Neck cranks", "Spine cranks", "Twisters", "Slams"] },
      { title: "Advanced, also permitted", lines: ["Toe hold", "Knee bar", "Calf slicer", "Flying submissions", "Jumping guard"] },
      { title: "Advanced, still prohibited", lines: ["Heel hooks", "Neck cranks", "Spine cranks", "Twisters", "Slams"] },
    ],
    bracket:
      "This card did not publish a drawn bracket. On Up ’n Roll, winners move forward, and if someone is out they continue on the other side of the card.",
    bracketHref: null,
    rankingsNote:
      "This card did not publish its own rankings list. The public board counts 3 points for each win until the official formula is set.",
    rankings: [],
    ending: [
      "Submission",
      "Points",
      "Opponent disqualification",
      "Referee stoppage",
      "Opponent withdrawal",
    ],
    endingNote: "A tie went to activity, then positional control, then submission attempts. A repeated penalty could end the match by disqualification.",
  },
};

export const HELD_COVERS = [
  {
    slug: "no-gi-12-july-2026",
    name: "No-Gi Grappling",
    date: "12 July 2026",
    line: "White belts, and blue and purple belts. Six-minute matches.",
  },
];
