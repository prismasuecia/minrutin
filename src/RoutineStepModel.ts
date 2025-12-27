export const StepStatus = {
  Todo: "todo",
  Running: "running",
  Done: "done",
} as const;

export type RoutineStep = {
  id: string;
  title: string;
  minutes: number;
  status: typeof StepStatus[keyof typeof StepStatus];
  remainingSeconds: number;
};

export type UserRoutine = {
  id: string;
  title: string;
  steps: RoutineStep[];
};

export function makeStep(id: string, title: string, minutes: number): RoutineStep {
  return {
    id,
    title,
    minutes,
    status: StepStatus.Todo,
    remainingSeconds: minutes * 60,
  };
}

export function defaultRoutineFor(mode: "morning" | "evening"): UserRoutine {
  if (mode === "morning") {
    return {
      id: "morning",
      title: "Morgon",
      steps: [
        makeStep("wake", "Gå upp", 5),
        makeStep("brush", "Borsta tänderna", 3),
        makeStep("dress", "Klä på dig", 5),
        makeStep("breakfast", "Äta frukost", 10),
      ],
    };
  }

  return {
    id: "evening",
    title: "Kväll",
    steps: [
      makeStep("brush", "Borsta tänderna", 3),
      makeStep("pyjamas", "Ta på pyjamas", 4),
      makeStep("read", "Läsa bok", 10),
    ],
  };
}
