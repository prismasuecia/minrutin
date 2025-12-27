export type Mode = "morning" | "evening";
export type Screen = "start" | "routine" | "settings";
export type ColorProfile = "calm" | "highContrast";
export type ViewMode = "focus" | "list";

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
  timerEnabled?: boolean;
  iconName?: string;
};

export type UserRoutine = {
  id: string;
  title: string;
  steps: RoutineStep[];
};

export type ChildProfile = {
  id: string;
  name: string;
  colorProfile: ColorProfile;
  viewMode: ViewMode;
  routines: UserRoutine[];
};

export type StoredState = {
  activeChildId: string;
  children: ChildProfile[];
  screen: Screen;
  routine: UserRoutine | null;
  totalSeconds: number;
  paused: boolean;
};

export function defaultMorningRoutine(): UserRoutine {
  return {
    id: "morning-" + Math.random().toString(36).substr(2, 9),
    title: "Morgonrutin",
    steps: [
      {
        id: "morning-wake",
        title: "Gå upp",
        minutes: 2,
        status: StepStatus.Todo,
        remainingSeconds: 120,
        timerEnabled: true,
        iconName: "wake-up",
      },
      {
        id: "morning-brush",
        title: "Borsta tänderna",
        minutes: 3,
        status: StepStatus.Todo,
        remainingSeconds: 180,
        timerEnabled: true,
        iconName: "brush-teeth",
      },
      {
        id: "morning-dress",
        title: "Klä på dig",
        minutes: 5,
        status: StepStatus.Todo,
        remainingSeconds: 300,
        timerEnabled: true,
        iconName: "get-dressed",
      },
      {
        id: "morning-eat",
        title: "Äta frukost",
        minutes: 10,
        status: StepStatus.Todo,
        remainingSeconds: 600,
        timerEnabled: true,
        iconName: "eat-breakfast",
      },
    ],
  };
}

export function defaultEveningRoutine(): UserRoutine {
  return {
    id: "evening-" + Math.random().toString(36).substr(2, 9),
    title: "Kvällsrutin",
    steps: [
      {
        id: "evening-brush",
        title: "Borsta tänderna",
        minutes: 3,
        status: StepStatus.Todo,
        remainingSeconds: 180,
        timerEnabled: true,
        iconName: "brush-teeth",
      },
      {
        id: "pyjamas",
        title: "Ta på pyjamas",
        minutes: 4,
        status: StepStatus.Todo,
        remainingSeconds: 240,
        timerEnabled: true,
        iconName: "get-dressed",
      },
      {
        id: "read",
        title: "Läsa bok",
        minutes: 10,
        status: StepStatus.Todo,
        remainingSeconds: 600,
        timerEnabled: true,
        iconName: "read-book",
      },
      {
        id: "sleep",
        title: "Sova",
        minutes: 0,
        status: StepStatus.Todo,
        remainingSeconds: 0,
        timerEnabled: false,
        iconName: "bedtime",
      },
    ],
  };
}

export function setStepStatus(
  routine: UserRoutine,
  stepId: string,
  status: typeof StepStatus[keyof typeof StepStatus]
): UserRoutine {
  const updatedSteps = routine.steps.map((s) => {
    if (s.id !== stepId) return s;
    let remaining = s.remainingSeconds;
    if (status === StepStatus.Done) {
      remaining = 0;
    } else if (status === StepStatus.Todo) {
      remaining = s.minutes * 60;
    }
    return { ...s, status, remainingSeconds: remaining };
  });
  return { ...routine, steps: updatedSteps };
}

export function resetRoutine(routine: UserRoutine): UserRoutine {
  return {
    ...routine,
    steps: routine.steps.map((s) => ({
      ...s,
      status: StepStatus.Todo,
      remainingSeconds: s.minutes * 60,
    })),
  };
}

export function createDefaultChild(name: string): ChildProfile {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    colorProfile: "calm",
    viewMode: "focus",
    routines: [
      defaultMorningRoutine(),
      defaultEveningRoutine(),
    ],
  };
}

export function createEmptyRoutine(title: string): UserRoutine {
  return {
    id: "routine-" + Math.random().toString(36).substr(2, 9),
    title,
    steps: [
      {
        id: "step-1",
        title: "Steg 1",
        minutes: 5,
        status: StepStatus.Todo,
        remainingSeconds: 300,
        timerEnabled: true,
      },
    ],
  };
}