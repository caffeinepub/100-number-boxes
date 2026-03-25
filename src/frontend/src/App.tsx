import { Toaster } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "./hooks/useActor";

const GAMES = ["DS", "FB", "GB", "GL"] as const;
const RADIO_OPTIONS = [
  "Actual Yantri",
  "Daily Collection",
  "Agent",
  "Patti",
] as const;
const B_LABELS = ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B0"];
const A_LABELS = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A0"];
const COL_HEADERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const ROWS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const COLS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const LS_HISTORY_KEY = "lottery_history_v1";
const LS_FORM_KEY = "lottery_form_state_v1";
const LS_GAME_DATA_KEY = "lottery_game_data_v2";

const LS_LANG_KEY = "appLanguage";

const TRANSLATIONS = {
  hi: {
    appTitle: "लॉटरी कलेक्शन एंट्री",
    home: "होम",
    search: "खोजें",
    entry: "एंट्री",
    settings: "सेटिंग",
    history: "इतिहास",
    historyTitle: "📋 इतिहास (History)",
    save: "सहेजें",
    saving: "सहेज रहे हैं...",
    show: "दिखाएं",
    clearAll: "🗑 साफ करें",
    searchAndAdd: "नंबर खोजें और जोड़ें",
    add: "✚ जोड़ें",
    delete: "🗑 हटाएं",
    close: "✕ बंद करें",
    selectGame: "🎮 गेम चुनें",
    whichGame: "कौन सा गेम खोलना है?",
    party: "पार्टी",
    date: "तारीख",
    game: "गेम",
    cutting: "कटिंग",
    grandTotal: "Grand Total",
    total: "कुल",
    topBA: "ऊपर B/A",
    bottomBA: "नीचे B/A",
    searchNumber: "नंबर खोजें और जोड़ें",
    currentAmount: "का अभी का amount:",
    addAmount: "जोड़ने की राशि:",
    addAmountPlaceholder: "राशि डालें",
    saved: "Data save ho gaya!",
    confirmClear: "क्या आप सभी amount साफ करना चाहते हैं?",
    noHistory: "कोई इतिहास नहीं",
    gameHistory: "गेम की",
    backendLoading: "बैकएंड से लोड हो रहा है...",
    backendData: "📦 बैकएंड से सेव डेटा:",
    openGame: "खोलें →",
    changeGame: "← गेम बदलें",
    gameOpen: "खुला है",
    todayInfo: "आज की जानकारी",
    numbersFilled: "नंबर भरे हुए हैं",
    fullGrid: "100 नंबर का पूरा grid, B/A sections",
    recentHistory: "की हाल की history:",
    numberInput: "नंबर डालें (1 से 100):",
    numberPlaceholder: "जैसे: 25",
    active: "✓ चल रहा",
    searchAddLabel: "🔍 खोजें+जोड़ें:",
    selectParty: "Select Party:",
    partyPlaceholder: "Party name...",
    pattiSale: "PATTI SALE",
    userFilter: "USER FILTER",
    allUsers: "All Users",
    selectedUsers: "Selected Users",
    timeCol: "समय",
    partyCol: "पार्टी",
    totalCol: "कुल",
    deleteCol: "हटाएं",
    entries: "entries",
    language: "भाषा / Language",
    hindi: "हिंदी (Hindi)",
    english: "English",
    settingsTitle: "⚙️ सेटिंग",
    langHi: "हिंदी",
    langEn: "अंग्रेजी",
    invalidNumber: "Sahi number daalen (1 se 100 ke beech)",
    enterAmount: "Add karne ki amount daalen",
    addedSuccess: "mein add ho gaya!",
    deleteSuccess: "Record delete ho gaya!",
    deleteFail: "Delete nahi hua, dobara try karein",
    enterParty: "Party name daalen",
    dataLoaded: "Data load ho gaya!",
    noData: "Koi data nahi mila",
    backendError: "Backend se connect nahi hua",
    backendConnectError: "Backend connect nahi hua",
    doEntry: "Entry करें",
  },
  en: {
    appTitle: "Lottery Collection Entry",
    home: "Home",
    search: "Search",
    entry: "Entry",
    settings: "Settings",
    history: "History",
    historyTitle: "📋 History",
    save: "Save",
    saving: "Saving...",
    show: "Show",
    clearAll: "🗑 Clear All",
    searchAndAdd: "Search & Add Number",
    add: "✚ Add",
    delete: "🗑 Delete",
    close: "✕ Close",
    selectGame: "🎮 Select Game",
    whichGame: "Which game do you want to open?",
    party: "Party",
    date: "Date",
    game: "Game",
    cutting: "Cutting",
    grandTotal: "Grand Total",
    total: "Total",
    topBA: "Top B/A",
    bottomBA: "Bottom B/A",
    searchNumber: "Search & Add Number",
    currentAmount: "current amount:",
    addAmount: "Add Amount:",
    addAmountPlaceholder: "Enter amount",
    saved: "Data saved!",
    confirmClear: "Do you want to clear all amounts?",
    noHistory: "No History",
    gameHistory: "game",
    backendLoading: "Loading from backend...",
    backendData: "📦 Backend Saved Data:",
    openGame: "Open →",
    changeGame: "← Change Game",
    gameOpen: "Open",
    todayInfo: "Today's Info",
    numbersFilled: "numbers filled",
    fullGrid: "Full 100 number grid, B/A sections",
    recentHistory: "recent history:",
    numberInput: "Enter number (1 to 100):",
    numberPlaceholder: "e.g.: 25",
    active: "✓ Active",
    searchAddLabel: "🔍 Search+Add:",
    selectParty: "Select Party:",
    partyPlaceholder: "Party name...",
    pattiSale: "PATTI SALE",
    userFilter: "USER FILTER",
    allUsers: "All Users",
    selectedUsers: "Selected Users",
    timeCol: "Time",
    partyCol: "Party",
    totalCol: "Total",
    deleteCol: "Delete",
    entries: "entries",
    language: "Language / भाषा",
    hindi: "हिंदी (Hindi)",
    english: "English",
    settingsTitle: "⚙️ Settings",
    langHi: "Hindi",
    langEn: "English",
    invalidNumber: "Please enter a valid number (1 to 100)",
    enterAmount: "Please enter amount to add",
    addedSuccess: "added to number",
    deleteSuccess: "Record deleted!",
    deleteFail: "Delete failed, please try again",
    enterParty: "Please enter party name",
    dataLoaded: "Data loaded!",
    noData: "No data found",
    backendError: "Backend not connected",
    backendConnectError: "Backend not connected",
    doEntry: "Do Entry",
  },
} as const;

type Lang = "hi" | "en";

const GAME_COLORS: Record<
  string,
  { bg: string; border: string; text: string; light: string }
> = {
  DS: { bg: "#003366", border: "#001133", text: "#66aaff", light: "#e8f0ff" },
  FB: { bg: "#006600", border: "#003300", text: "#66cc66", light: "#e8ffe8" },
  GB: { bg: "#cc6600", border: "#883300", text: "#ffcc66", light: "#fff3e0" },
  GL: { bg: "#660066", border: "#330033", text: "#cc88cc", light: "#ffe8ff" },
};

interface GameData {
  values: string[];
  bValues: string[];
  aValues: string[];
  party: string;
  pattiSale: boolean;
  radioOption: string;
  cuttingType: "decrease" | "increase";
  cuttingAmount: string;
  cuttingPercentage: string;
  multiplyN: string;
}

interface LocalHistoryEntry {
  date: string;
  game: string;
  party: string;
  grandTotal: number;
  savedAt: number;
}

interface FormState {
  date: string;
  game: string;
  radioOption: string;
  party: string;
  pattiSale: boolean;
  values: string[];
  bValues: string[];
  aValues: string[];
  cuttingType: "decrease" | "increase";
  cuttingAmount: string;
  cuttingPercentage: string;
  multiplyN: string;
  highColor: boolean;
}

type Screen = "gameselect" | "home" | "search" | "entry" | "settings" | "chat";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultGameData(): GameData {
  return {
    values: Array(100).fill(""),
    bValues: Array(10).fill(""),
    aValues: Array(10).fill(""),
    party: "",
    pattiSale: false,
    radioOption: "Daily Collection",
    cuttingType: "decrease",
    cuttingAmount: "",
    cuttingPercentage: "",
    multiplyN: "",
  };
}

function loadGameDataMap(): Record<string, GameData> {
  try {
    const raw = localStorage.getItem(LS_GAME_DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, Partial<GameData>>;
      const result: Record<string, GameData> = {};
      for (const g of GAMES) {
        const p = parsed[g] ?? {};
        result[g] = {
          values: p.values ?? Array(100).fill(""),
          bValues: p.bValues ?? Array(10).fill(""),
          aValues: p.aValues ?? Array(10).fill(""),
          party: p.party ?? "",
          pattiSale: p.pattiSale ?? false,
          radioOption: p.radioOption ?? "Daily Collection",
          cuttingType: p.cuttingType ?? "decrease",
          cuttingAmount: p.cuttingAmount ?? "",
          cuttingPercentage: p.cuttingPercentage ?? "",
          multiplyN: p.multiplyN ?? "",
        };
      }
      return result;
    }
  } catch {
    // ignore
  }
  const result: Record<string, GameData> = {};
  for (const g of GAMES) result[g] = defaultGameData();
  return result;
}

function saveGameDataMap(map: Record<string, GameData>) {
  try {
    localStorage.setItem(LS_GAME_DATA_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function loadFormState(): FormState {
  try {
    const raw = localStorage.getItem(LS_FORM_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<FormState>;
      return {
        date: parsed.date ?? todayStr(),
        game: parsed.game ?? "DS",
        radioOption: parsed.radioOption ?? "Daily Collection",
        party: parsed.party ?? "",
        pattiSale: parsed.pattiSale ?? false,
        values: parsed.values ?? Array(100).fill(""),
        bValues: parsed.bValues ?? Array(10).fill(""),
        aValues: parsed.aValues ?? Array(10).fill(""),
        cuttingType: parsed.cuttingType ?? "decrease",
        cuttingAmount: parsed.cuttingAmount ?? "",
        cuttingPercentage: parsed.cuttingPercentage ?? "",
        multiplyN: parsed.multiplyN ?? "",
        highColor: parsed.highColor ?? false,
      };
    }
  } catch {
    // ignore
  }
  return {
    date: todayStr(),
    game: "DS",
    radioOption: "Daily Collection",
    party: "",
    pattiSale: false,
    values: Array(100).fill(""),
    bValues: Array(10).fill(""),
    aValues: Array(10).fill(""),
    cuttingType: "decrease",
    cuttingAmount: "",
    cuttingPercentage: "",
    multiplyN: "",
    highColor: false,
  };
}

function loadLocalHistory(): LocalHistoryEntry[] {
  try {
    const raw = localStorage.getItem(LS_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalHistoryEntry[];
  } catch {
    return [];
  }
}

function saveLocalHistory(entries: LocalHistoryEntry[]) {
  try {
    localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

function toNum(v: string): number {
  const n = Number.parseFloat(v);
  return Number.isNaN(n) ? 0 : n;
}

function fmt(n: number): string {
  return n === 0 ? "" : String(n);
}

function dateToTime(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime() * 1_000_000);
}

function parseChatInput(text: string): Array<{ num: number; amount: number }> {
  const results: Array<{ num: number; amount: number }> = [];
  const seen = new Set<number>();
  const cleaned = text
    .replace(/नंबर|number|no\.|no |पर|में|pe|mein|add|jodo|जोड़ो/gi, " ")
    .replace(/[,;|]/g, " ");
  const patternSources = [
    "(\\d{1,3})\\s*[-:=]\\s*(\\d+)",
    "(\\d{1,3})\\s+(\\d{2,})",
  ];
  for (const src of patternSources) {
    const regex = new RegExp(src, "g");
    let match = regex.exec(cleaned);
    while (match !== null) {
      const num = Number.parseInt(match[1], 10);
      const amount = Number.parseInt(match[2], 10);
      if (num >= 1 && num <= 100 && amount > 0 && !seen.has(num)) {
        seen.add(num);
        results.push({ num, amount });
      }
      match = regex.exec(cleaned);
    }
  }
  return results;
}

function calcGrandTotal(gd: GameData): number {
  return gd.values.reduce((s, v) => s + toNum(v), 0);
}

export default function App() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  const initialForm = useMemo(() => loadFormState(), []);

  // Per-game data map
  const [gameDataMap, setGameDataMap] = useState<Record<string, GameData>>(() =>
    loadGameDataMap(),
  );

  const [screen, setScreen] = useState<Screen>("gameselect");
  const [date, setDate] = useState(initialForm.date);
  const [game, setGame] = useState(initialForm.game);
  const [radioOption, setRadioOption] = useState(initialForm.radioOption);
  const [userFilter, setUserFilter] = useState<"all" | "selected">("all");
  const [party, setParty] = useState(initialForm.party);
  const [pattiSale, setPattiSale] = useState(initialForm.pattiSale);
  const [values, setValues] = useState<string[]>(initialForm.values);
  const [bValues, setBValues] = useState<string[]>(initialForm.bValues);
  const [aValues, setAValues] = useState<string[]>(initialForm.aValues);
  const [cuttingType, setCuttingType] = useState<"decrease" | "increase">(
    initialForm.cuttingType,
  );
  const [cuttingAmount, setCuttingAmount] = useState(initialForm.cuttingAmount);
  const [cuttingPercentage, setCuttingPercentage] = useState(
    initialForm.cuttingPercentage,
  );
  const [multiplyN, setMultiplyN] = useState(initialForm.multiplyN);
  const [highColor, setHighColor] = useState(initialForm.highColor);
  const [language, setLanguage] = useState<Lang>(() => {
    const stored = localStorage.getItem(LS_LANG_KEY);
    return stored === "hi" || stored === "en" ? stored : "hi";
  });
  const t = TRANSLATIONS[language];
  const changeLanguage = (lang: Lang) => {
    setLanguage(lang);
    localStorage.setItem(LS_LANG_KEY, lang);
  };
  const [showHistory, setShowHistory] = useState(false);
  const [historyGameTab, setHistoryGameTab] = useState<string>("DS");
  const [localHistory, setLocalHistory] = useState<LocalHistoryEntry[]>(() =>
    loadLocalHistory(),
  );

  // Search + Add state
  const [searchNum, setSearchNum] = useState("");
  const [addAmount, setAddAmount] = useState("");

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatParsed, setChatParsed] = useState<
    Array<{ num: number; amount: number }>
  >([]);

  // Track previous game to save/load on change
  const prevGameRef = useRef(game);
  // Keep a ref of current values so we can snapshot without deps
  const currentFieldsRef = useRef<GameData>({
    values,
    bValues,
    aValues,
    party,
    pattiSale,
    radioOption,
    cuttingType,
    cuttingAmount,
    cuttingPercentage,
    multiplyN,
  });
  useEffect(() => {
    currentFieldsRef.current = {
      values,
      bValues,
      aValues,
      party,
      pattiSale,
      radioOption,
      cuttingType,
      cuttingAmount,
      cuttingPercentage,
      multiplyN,
    };
  }, [
    values,
    bValues,
    aValues,
    party,
    pattiSale,
    radioOption,
    cuttingType,
    cuttingAmount,
    cuttingPercentage,
    multiplyN,
  ]);

  // When game changes, save current data to map and load new game data
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally only trigger on game change
  useEffect(() => {
    const prevGame = prevGameRef.current;
    if (prevGame === game) return;
    // Save current game data using ref snapshot (no stale closure)
    const snapshot = currentFieldsRef.current;
    setGameDataMap((prev) => {
      const updated = {
        ...prev,
        [prevGame]: snapshot,
      };
      saveGameDataMap(updated);
      return updated;
    });
    // Load new game data
    const newGameData = gameDataMap[game] ?? defaultGameData();
    setValues(newGameData.values);
    setBValues(newGameData.bValues);
    setAValues(newGameData.aValues);
    setParty(newGameData.party);
    setPattiSale(newGameData.pattiSale);
    setRadioOption(newGameData.radioOption);
    setCuttingType(newGameData.cuttingType);
    setCuttingAmount(newGameData.cuttingAmount);
    setCuttingPercentage(newGameData.cuttingPercentage);
    setMultiplyN(newGameData.multiplyN);
    prevGameRef.current = game;
  }, [game]);

  // Auto-save current game data to map whenever values change
  const gameDataSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (gameDataSaveTimer.current) clearTimeout(gameDataSaveTimer.current);
    gameDataSaveTimer.current = setTimeout(() => {
      setGameDataMap((prev) => {
        const updated = {
          ...prev,
          [game]: {
            values,
            bValues,
            aValues,
            party,
            pattiSale,
            radioOption,
            cuttingType,
            cuttingAmount,
            cuttingPercentage,
            multiplyN,
          },
        };
        saveGameDataMap(updated);
        return updated;
      });
    }, 500);
    return () => {
      if (gameDataSaveTimer.current) clearTimeout(gameDataSaveTimer.current);
    };
  }, [
    game,
    values,
    bValues,
    aValues,
    party,
    pattiSale,
    radioOption,
    cuttingType,
    cuttingAmount,
    cuttingPercentage,
    multiplyN,
  ]);

  // Auto-save form state to localStorage on every change (debounced)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        const state: FormState = {
          date,
          game,
          radioOption,
          party,
          pattiSale,
          values,
          bValues,
          aValues,
          cuttingType,
          cuttingAmount,
          cuttingPercentage,
          multiplyN,
          highColor,
        };
        localStorage.setItem(LS_FORM_KEY, JSON.stringify(state));
      } catch {
        // ignore
      }
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [
    date,
    game,
    radioOption,
    party,
    pattiSale,
    values,
    bValues,
    aValues,
    cuttingType,
    cuttingAmount,
    cuttingPercentage,
    multiplyN,
    highColor,
  ]);

  // Sync localHistory to localStorage
  useEffect(() => {
    saveLocalHistory(localHistory);
  }, [localHistory]);

  const searchIndex = useMemo(() => {
    const n = Number.parseInt(searchNum, 10);
    if (Number.isNaN(n) || n < 1 || n > 100) return -1;
    return n - 1;
  }, [searchNum]);

  const searchCurrentValue = useMemo(() => {
    if (searchIndex < 0) return null;
    return toNum(values[searchIndex]);
  }, [searchIndex, values]);

  const handleSearchAdd = useCallback(() => {
    if (searchIndex < 0) {
      toast.error(t.invalidNumber);
      return;
    }
    const addVal = toNum(addAmount);
    if (addVal === 0) {
      toast.error(t.enterAmount);
      return;
    }
    setValues((prev) => {
      const next = [...prev];
      const current = toNum(next[searchIndex]);
      next[searchIndex] = String(current + addVal);
      return next;
    });
    toast.success(`${searchNum} ${t.addedSuccess} ${addVal}!`);
    setAddAmount("");
    setSearchNum("");
  }, [searchIndex, addAmount, searchNum, t]);

  const rowTotals = useMemo(() => {
    return ROWS.map((row) =>
      values.slice(row * 10, row * 10 + 10).reduce((s, v) => s + toNum(v), 0),
    );
  }, [values]);

  const colTotals = useMemo(() => {
    return COLS.map((col) =>
      ROWS.map((row) => toNum(values[row * 10 + col])).reduce(
        (s, v) => s + v,
        0,
      ),
    );
  }, [values]);

  const bTotal = useMemo(
    () => bValues.reduce((s, v) => s + toNum(v), 0),
    [bValues],
  );
  const aTotal = useMemo(
    () => aValues.reduce((s, v) => s + toNum(v), 0),
    [aValues],
  );
  const grandTotal = useMemo(
    () => rowTotals.reduce((s, v) => s + v, 0),
    [rowTotals],
  );

  const handleMainChange = useCallback((index: number, value: string) => {
    if (value !== "" && !/^\d*$/.test(value)) return;
    setValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleBChange = useCallback((index: number, value: string) => {
    if (value !== "" && !/^\d*$/.test(value)) return;
    setBValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleAChange = useCallback((index: number, value: string) => {
    if (value !== "" && !/^\d*$/.test(value)) return;
    setAValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const { refetch: fetchByParty } = useQuery({
    queryKey: ["party", party],
    queryFn: async () => {
      if (!actor || !party) return [];
      return actor.getDataByParty(party);
    },
    enabled: false,
  });

  const {
    data: historyData,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllData();
    },
    enabled: showHistory && !!actor,
  });

  const deleteMutation = useMutation({
    mutationFn: async ({
      date: d,
      game: g,
      party: p,
    }: { date: bigint; game: string; party: string }) => {
      if (!actor) throw new Error(t.backendConnectError);
      await actor.deleteData(d, g, p);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      toast.success(t.deleteSuccess);
    },
    onError: () => toast.error("Delete nahi hua, dobara try karein"),
  });

  const handleShow = async () => {
    if (!party) {
      toast.error(t.enterParty);
      return;
    }
    const result = await fetchByParty();
    if (result.data && result.data.length > 0) {
      const entry = result.data.find((e) => e.game === game) ?? result.data[0];
      const nums = Array(100).fill("");
      entry.numbers.forEach((v, i) => {
        if (i < 100) nums[i] = v === 0n ? "" : String(Number(v));
      });
      setValues(nums);
      const bs = Array(10).fill("");
      entry.bSection.forEach((v, i) => {
        if (i < 10) bs[i] = v === 0n ? "" : String(Number(v));
      });
      setBValues(bs);
      const as_ = Array(10).fill("");
      entry.aSection.forEach((v, i) => {
        if (i < 10) as_[i] = v === 0n ? "" : String(Number(v));
      });
      setAValues(as_);
      setCuttingAmount(
        Number(entry.cuttingAmount) === 0
          ? ""
          : String(Number(entry.cuttingAmount)),
      );
      setCuttingPercentage(
        Number(entry.cuttingPercentage) === 0
          ? ""
          : String(Number(entry.cuttingPercentage)),
      );
      setMultiplyN(
        Number(entry.multiplyValue) === 0
          ? ""
          : String(Number(entry.multiplyValue)),
      );
      toast.success("Data load ho gaya!");
    } else {
      toast.error("Koi data nahi mila");
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error(t.backendError);
      await actor.saveData(
        dateToTime(date),
        game,
        party,
        values.map((v) => BigInt(toNum(v))),
        bValues.map((v) => BigInt(toNum(v))),
        aValues.map((v) => BigInt(toNum(v))),
        BigInt(cuttingType === "decrease" ? 0 : 1),
        BigInt(toNum(cuttingAmount)),
        BigInt(toNum(cuttingPercentage)),
        BigInt(toNum(multiplyN)),
      );
    },
    onSuccess: () => {
      toast.success(t.saved);
      const newEntry: LocalHistoryEntry = {
        date,
        game,
        party,
        grandTotal,
        savedAt: Date.now(),
      };
      setLocalHistory((prev) => {
        const filtered = prev.filter(
          (e) => !(e.date === date && e.game === game && e.party === party),
        );
        return [newEntry, ...filtered];
      });
      setHistoryGameTab(game);
      setShowHistory(true);
      queryClient.invalidateQueries({ queryKey: ["history"] });
      refetchHistory();
    },
    onError: (e) => toast.error(`Save nahi hua: ${e}`),
  });

  const deleteLocalEntry = useCallback(
    (entry: LocalHistoryEntry) => {
      setLocalHistory((prev) =>
        prev.filter(
          (e) =>
            !(
              e.date === entry.date &&
              e.game === entry.game &&
              e.party === entry.party
            ),
        ),
      );
      toast.success(t.deleteSuccess);
    },
    [t],
  );

  // Filtered local history for current tab, grouped by date
  const filteredLocalHistory = useMemo(
    () => localHistory.filter((e) => e.game === historyGameTab),
    [localHistory, historyGameTab],
  );

  const groupedLocalHistory = useMemo(() => {
    const groups: Record<string, LocalHistoryEntry[]> = {};
    for (const entry of filteredLocalHistory) {
      if (!groups[entry.date]) groups[entry.date] = [];
      groups[entry.date].push(entry);
    }
    return Object.entries(groups).sort(([a], [b]) => (a > b ? -1 : 1));
  }, [filteredLocalHistory]);

  // Non-zero entries for the search screen list
  const nonZeroEntries = useMemo(() => {
    return values
      .map((v, i) => ({ num: i + 1, val: toNum(v) }))
      .filter((e) => e.val > 0);
  }, [values]);

  const todayDisplay = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Select a game from the game select screen
  const handleSelectGame = useCallback(
    (selectedGame: string) => {
      // Save current game data first
      setGameDataMap((prev) => {
        const updated = {
          ...prev,
          [game]: {
            values,
            bValues,
            aValues,
            party,
            pattiSale,
            radioOption,
            cuttingType,
            cuttingAmount,
            cuttingPercentage,
            multiplyN,
          },
        };
        saveGameDataMap(updated);
        return updated;
      });
      // Load new game
      const newGameData = gameDataMap[selectedGame] ?? defaultGameData();
      setValues(newGameData.values);
      setBValues(newGameData.bValues);
      setAValues(newGameData.aValues);
      setParty(newGameData.party);
      setPattiSale(newGameData.pattiSale);
      setRadioOption(newGameData.radioOption);
      setCuttingType(newGameData.cuttingType);
      setCuttingAmount(newGameData.cuttingAmount);
      setCuttingPercentage(newGameData.cuttingPercentage);
      setMultiplyN(newGameData.multiplyN);
      prevGameRef.current = selectedGame;
      setGame(selectedGame);
      setScreen("home");
    },
    [
      game,
      values,
      bValues,
      aValues,
      party,
      pattiSale,
      radioOption,
      cuttingType,
      cuttingAmount,
      cuttingPercentage,
      multiplyN,
      gameDataMap,
    ],
  );

  const gameColor = GAME_COLORS[game] ?? GAME_COLORS.DS;

  return (
    <div className="min-h-screen bg-[#f0f0f0] font-mono text-xs w-full flex flex-col">
      <Toaster />

      {/* ===== TOP NAV BAR ===== */}
      <div className="bg-[#003366] text-white px-3 py-1 flex items-center justify-between flex-shrink-0">
        <button
          type="button"
          onClick={() => setScreen("gameselect")}
          className="font-bold text-sm hover:text-[#ffcc44] transition-colors"
          data-ocid="nav.home.link"
        >
          Lottery Collection Entry
        </button>
        <div className="flex items-center gap-2">
          {screen !== "gameselect" && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-sm border"
              style={{
                backgroundColor: gameColor.bg,
                borderColor: gameColor.border,
                color: gameColor.text,
              }}
            >
              🎮 {game}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setShowHistory(true);
              refetchHistory();
            }}
            className="bg-[#cc8800] hover:bg-[#ffaa00] text-white text-[11px] font-bold px-3 py-0.5 border border-[#ffcc44] rounded-sm transition-colors"
            data-ocid="history.open_modal_button"
          >
            {t.history}
          </button>
          <span className="text-[10px] opacity-70">v4.0</span>
        </div>
      </div>

      {/* ===== HISTORY MODAL ===== */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto"
          data-ocid="history.modal"
        >
          <div className="bg-white w-full max-w-2xl my-4 mx-2 shadow-2xl rounded-sm">
            <div className="bg-[#003366] text-white px-4 py-2 flex items-center justify-between">
              <span className="font-bold text-sm">{t.historyTitle}</span>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="text-white hover:text-[#ffcc44] text-lg font-bold leading-none px-1"
                data-ocid="history.close_button"
              >
                {t.close}
              </button>
            </div>
            <div className="flex border-b-2 border-[#003366] bg-[#e8eef8]">
              {GAMES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setHistoryGameTab(g)}
                  className={`flex-1 py-2 text-[12px] font-bold border-r border-[#c0c0c0] last:border-r-0 transition-colors ${
                    historyGameTab === g
                      ? "bg-[#003366] text-white border-b-2 border-b-[#ffcc44]"
                      : "bg-[#e8eef8] text-[#003366] hover:bg-[#d0dcf0]"
                  }`}
                  data-ocid="history.tab"
                >
                  {g}
                </button>
              ))}
            </div>
            <div className="p-3">
              {historyLoading && (
                <div
                  className="text-center py-2 text-[#003366] font-bold text-[11px] mb-2"
                  data-ocid="history.loading_state"
                >
                  {t.backendLoading}
                </div>
              )}
              {groupedLocalHistory.length > 0 ? (
                <div>
                  {groupedLocalHistory.map(([groupDate, entries]) => (
                    <div key={groupDate} className="mb-3">
                      <div className="bg-[#003366] text-white px-3 py-1 text-[11px] font-bold flex items-center gap-2 mb-1">
                        <span>📅</span>
                        <span>
                          {new Date(groupDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                        <span className="ml-auto text-[#ffcc44]">
                          {entries.length} entries
                        </span>
                      </div>
                      <table className="w-full border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-[#dce8ff]">
                            <th className="border border-[#b0c4de] px-2 py-1 text-left text-[#003366]">
                              समय
                            </th>
                            <th className="border border-[#b0c4de] px-2 py-1 text-left text-[#003366]">
                              पार्टी
                            </th>
                            <th className="border border-[#b0c4de] px-2 py-1 text-right text-[#003366]">
                              कुल
                            </th>
                            <th className="border border-[#b0c4de] px-2 py-1 text-center text-[#003366]">
                              हटाएं
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map((entry, idx) => (
                            <tr
                              key={`${entry.date}-${entry.game}-${entry.party}-${entry.savedAt}`}
                              className={
                                idx % 2 === 0 ? "bg-white" : "bg-[#f5f8ff]"
                              }
                              data-ocid={`history.item.${idx + 1}`}
                            >
                              <td className="border border-[#c0c0c0] px-2 py-1 text-[#555]">
                                {new Date(entry.savedAt).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  },
                                )}
                              </td>
                              <td className="border border-[#c0c0c0] px-2 py-1">
                                {entry.party || "-"}
                              </td>
                              <td className="border border-[#c0c0c0] px-2 py-1 text-right font-bold text-[#cc0000]">
                                {entry.grandTotal.toLocaleString("en-IN")}
                              </td>
                              <td className="border border-[#c0c0c0] px-2 py-1 text-center">
                                <button
                                  type="button"
                                  onClick={() => deleteLocalEntry(entry)}
                                  className="bg-[#cc0000] hover:bg-[#ee0000] text-white px-2 py-0.5 text-[10px] font-bold border border-[#880000]"
                                  data-ocid={`history.delete_button.${idx + 1}`}
                                >
                                  {t.delete}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="text-center py-6 text-[#666] text-sm"
                  data-ocid="history.empty_state"
                >
                  <div className="text-2xl mb-2">📭</div>
                  <div className="font-bold text-[#003366]">
                    {historyGameTab} गेम की
                  </div>
                  <div>कोई इतिहास नहीं</div>
                </div>
              )}
              {historyData && historyData.length > 0 && (
                <div className="mt-4 border-t-2 border-dashed border-[#c0c0c0] pt-3">
                  <div className="text-[11px] font-bold text-[#003366] mb-2">
                    {t.backendData}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-[#003366] text-white">
                          <th className="border border-[#004488] px-2 py-1 text-left">
                            तारीख
                          </th>
                          <th className="border border-[#004488] px-2 py-1 text-left">
                            गेम
                          </th>
                          <th className="border border-[#004488] px-2 py-1 text-left">
                            पार्टी
                          </th>
                          <th className="border border-[#004488] px-2 py-1 text-right">
                            कुल
                          </th>
                          <th className="border border-[#004488] px-2 py-1 text-center">
                            हटाएं
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData
                          .filter((e) => e.game === historyGameTab)
                          .map((entry, idx) => {
                            const total = entry.numbers.reduce(
                              (s, v) => s + Number(v),
                              0,
                            );
                            return (
                              <tr
                                key={`be-${String(entry.date)}-${entry.game}-${entry.party}`}
                                className={
                                  idx % 2 === 0 ? "bg-white" : "bg-[#f5f8ff]"
                                }
                              >
                                <td className="border border-[#c0c0c0] px-2 py-1">
                                  {new Date(
                                    Number(entry.date) / 1_000_000,
                                  ).toLocaleDateString("en-IN")}
                                </td>
                                <td className="border border-[#c0c0c0] px-2 py-1 font-bold">
                                  {entry.game}
                                </td>
                                <td className="border border-[#c0c0c0] px-2 py-1">
                                  {entry.party || "-"}
                                </td>
                                <td className="border border-[#c0c0c0] px-2 py-1 text-right font-bold text-[#cc0000]">
                                  {total.toLocaleString("en-IN")}
                                </td>
                                <td className="border border-[#c0c0c0] px-2 py-1 text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteMutation.mutate({
                                        date: entry.date,
                                        game: entry.game,
                                        party: entry.party,
                                      })
                                    }
                                    className="bg-[#cc0000] hover:bg-[#ee0000] text-white px-2 py-0.5 text-[10px] font-bold border border-[#880000]"
                                    data-ocid={`history.delete_button.${idx + 1}`}
                                  >
                                    {t.delete}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 overflow-y-auto pb-16">
        {/* ===== GAME SELECT SCREEN ===== */}
        {screen === "gameselect" && (
          <div className="p-4" data-ocid="gameselect.section">
            <div className="text-center mb-6">
              <div className="text-[22px] font-bold text-[#003366] mb-1">
                {t.selectGame}
              </div>
              <div className="text-[12px] text-[#666]">{t.whichGame}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {GAMES.map((g) => {
                const gc = GAME_COLORS[g];
                const gd = gameDataMap[g] ?? defaultGameData();
                const gt = calcGrandTotal(gd);
                const isActive = game === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleSelectGame(g)}
                    className="relative flex flex-col items-center justify-center rounded-sm shadow-lg border-4 p-6 active:opacity-90 transition-all min-h-[160px]"
                    style={{
                      backgroundColor: gc.bg,
                      borderColor: isActive ? "#ffcc44" : gc.border,
                    }}
                    data-ocid={`gameselect.${g.toLowerCase()}.button`}
                  >
                    {isActive && (
                      <span className="absolute top-2 right-2 bg-[#ffcc44] text-[#003366] text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                        {t.active}
                      </span>
                    )}
                    <div
                      className="text-[48px] font-bold leading-none mb-2"
                      style={{ color: gc.text }}
                    >
                      {g}
                    </div>
                    <div className="text-white text-[11px] opacity-80 mb-1">
                      {g === "DS" && (language === "hi" ? "डी एस" : "DS")}
                      {g === "FB" && (language === "hi" ? "एफ बी" : "FB")}
                      {g === "GB" && (language === "hi" ? "जी बी" : "GB")}
                      {g === "GL" && (language === "hi" ? "जी एल" : "GL")}
                    </div>
                    <div className="mt-2 bg-black/30 rounded-sm px-3 py-1 text-center">
                      <div className="text-[9px] text-white opacity-70">
                        Grand Total
                      </div>
                      <div
                        className="text-[18px] font-bold leading-tight"
                        style={{ color: gt > 0 ? "#ffcc44" : "#ffffff99" }}
                      >
                        {gt > 0 ? gt.toLocaleString("en-IN") : "0"}
                      </div>
                    </div>
                    <div
                      className="mt-3 text-[12px] font-bold px-4 py-1 rounded-sm"
                      style={{ backgroundColor: gc.text, color: gc.bg }}
                    >
                      {t.openGame}
                    </div>
                  </button>
                );
              })}
            </div>

            <footer className="text-center text-[10px] text-[#666] py-4 mt-6 border-t border-[#c0c0c0]">
              © {currentYear}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#003366] hover:underline"
              >
                caffeine.ai
              </a>
            </footer>
          </div>
        )}

        {/* ===== HOME SCREEN ===== */}
        {screen === "home" && (
          <div className="p-4" data-ocid="home.section">
            {/* Game Badge + Back */}
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setScreen("gameselect")}
                className="flex items-center gap-1 bg-white border border-[#c0c0c0] text-[11px] font-bold px-2 py-1 rounded-sm hover:bg-[#f0f0f0] transition-colors"
                data-ocid="home.gameselect.button"
              >
                {t.changeGame}
              </button>
              <span
                className="text-[13px] font-bold px-3 py-1 rounded-sm"
                style={{ backgroundColor: gameColor.bg, color: gameColor.text }}
              >
                🎮 {game} — {t.gameOpen}
              </span>
            </div>

            {/* Summary Card */}
            <div
              className="text-white rounded-sm p-3 mb-4 shadow"
              style={{ backgroundColor: gameColor.bg }}
            >
              <div className="text-[11px] opacity-75 mb-1">{t.todayInfo}</div>
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <span className="text-[10px] opacity-60">{t.date}: </span>
                  <span className="font-bold text-[12px]">{todayDisplay}</span>
                </div>
                <div>
                  <span className="text-[10px] opacity-60">{t.game}: </span>
                  <span
                    className="font-bold text-[14px]"
                    style={{ color: gameColor.text }}
                  >
                    {game}
                  </span>
                </div>
                {party && (
                  <div>
                    <span className="text-[10px] opacity-60">{t.party}: </span>
                    <span className="font-bold text-[12px]">{party}</span>
                  </div>
                )}
                <div className="ml-auto">
                  <span className="text-[10px] opacity-60">Grand Total: </span>
                  <span className="font-bold text-[16px] text-[#ff6666]">
                    {grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Two Big Action Cards */}
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setScreen("search")}
                className="w-full bg-gradient-to-br from-[#cc8800] to-[#ffaa00] text-white rounded-sm shadow-lg border-2 border-[#aa6600] p-6 text-left active:opacity-90 hover:from-[#dd9900] hover:to-[#ffbb11] transition-all"
                data-ocid="home.search.button"
              >
                <div className="text-3xl mb-2">🔍</div>
                <div className="font-bold text-lg leading-tight">
                  {t.searchNumber}
                </div>
                <div className="text-[12px] opacity-80 mt-1">
                  {language === "hi"
                    ? "किसी भी नंबर (1-100) में amount जोड़ें"
                    : "Add amount to any number (1-100)"}
                </div>
                <div className="mt-3 text-[11px] bg-black/20 inline-block px-2 py-1 rounded-sm">
                  {nonZeroEntries.length} {t.numbersFilled}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScreen("entry")}
                className="w-full text-white rounded-sm shadow-lg border-2 p-6 text-left active:opacity-90 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${gameColor.bg}, ${gameColor.bg}dd)`,
                  borderColor: gameColor.border,
                }}
                data-ocid="home.entry.button"
              >
                <div className="text-3xl mb-2">📝</div>
                <div className="font-bold text-lg leading-tight">
                  {t.doEntry}
                </div>
                <div className="text-[12px] opacity-80 mt-1">{t.fullGrid}</div>
                <div className="mt-3 text-[11px] bg-black/20 inline-block px-2 py-1 rounded-sm">
                  Grand Total: {grandTotal.toLocaleString("en-IN")}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScreen("chat")}
                className="w-full bg-gradient-to-br from-[#003366] to-[#0055aa] text-white rounded-sm shadow-lg border-2 border-[#001133] p-6 text-left active:opacity-90 hover:from-[#004488] hover:to-[#0066cc] transition-all"
                data-ocid="home.chat.button"
              >
                <div className="text-3xl mb-2">💬</div>
                <div className="font-bold text-lg leading-tight">
                  {language === "hi" ? "स्मार्ट चैट एंट्री" : "Smart Chat Entry"}
                </div>
                <div className="text-[12px] opacity-80 mt-1">
                  {language === "hi"
                    ? "टेक्स्ट से नंबर और amount auto-detect होगा"
                    : "Auto-detect numbers and amounts from text"}
                </div>
              </button>
            </div>

            {/* Recent History Quick View */}
            {localHistory.filter((e) => e.game === game).length > 0 && (
              <div className="mt-4">
                <div className="text-[11px] font-bold text-[#003366] mb-2">
                  🕐 {game} {t.recentHistory}
                </div>
                <div className="bg-white border border-[#c0c0c0] rounded-sm overflow-hidden">
                  {localHistory
                    .filter((e) => e.game === game)
                    .slice(0, 5)
                    .map((entry, idx) => (
                      <div
                        key={`${entry.date}-${entry.game}-${entry.savedAt}`}
                        className={`flex items-center justify-between px-3 py-1.5 border-b border-[#eee] ${
                          idx % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"
                        }`}
                        data-ocid={`home.history.item.${idx + 1}`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
                            style={{ backgroundColor: gameColor.bg }}
                          >
                            {entry.game}
                          </span>
                          <span className="text-[11px] text-[#555]">
                            {entry.party || "—"}
                          </span>
                          <span className="text-[10px] text-[#999]">
                            {entry.date}
                          </span>
                        </div>
                        <span className="font-bold text-[12px] text-[#cc0000]">
                          {entry.grandTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== SEARCH SCREEN ===== */}
        {screen === "search" && (
          <div className="p-3" data-ocid="search.section">
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setScreen("gameselect")}
                className="flex items-center gap-1 bg-[#003366] text-white text-[12px] font-bold px-3 py-1.5 rounded-sm hover:bg-[#004488] active:opacity-80 transition-colors"
                data-ocid="search.home_button"
              >
                {t.home}
              </button>
              <span
                className="text-[12px] font-bold px-3 py-1 rounded-sm"
                style={{ backgroundColor: gameColor.bg, color: gameColor.text }}
              >
                {game}
              </span>
            </div>
            <div className="bg-[#fffbe6] border-2 border-[#cc8800] rounded-sm p-4 mb-4">
              <div className="text-[14px] font-bold text-[#cc6600] mb-4">
                🔍 {t.searchNumber}
              </div>

              {/* Number Input */}
              <div className="mb-3">
                <label
                  htmlFor="search-num-page"
                  className="block text-[11px] font-bold text-[#663300] mb-1"
                >
                  {t.numberInput}
                </label>
                <input
                  id="search-num-page"
                  type="text"
                  inputMode="numeric"
                  value={searchNum}
                  onChange={(e) => {
                    if (/^\d{0,3}$/.test(e.target.value))
                      setSearchNum(e.target.value);
                  }}
                  placeholder={t.numberPlaceholder}
                  className="w-full border-2 border-[#cc8800] bg-white px-3 py-2 text-[18px] font-bold text-center focus:outline-none focus:border-[#cc6600]"
                  data-ocid="search.number.input"
                />
              </div>

              {/* Current Value Display */}
              {searchCurrentValue !== null && (
                <div className="mb-3 bg-[#fff3cd] border border-[#cc8800] rounded-sm p-3 text-center">
                  <div className="text-[11px] text-[#663300] mb-1">
                    {t.search} {searchNum} {t.currentAmount}
                  </div>
                  <div
                    className="text-[32px] font-bold text-[#cc0000] leading-none"
                    data-ocid="search.current_value"
                  >
                    {searchCurrentValue.toLocaleString("en-IN")}
                  </div>
                </div>
              )}

              {/* Add Amount Input */}
              <div className="mb-3">
                <label
                  htmlFor="add-amount-page"
                  className="block text-[11px] font-bold text-[#004400] mb-1"
                >
                  {t.addAmount}
                </label>
                <input
                  id="add-amount-page"
                  type="text"
                  inputMode="numeric"
                  value={addAmount}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value))
                      setAddAmount(e.target.value);
                  }}
                  placeholder={t.addAmountPlaceholder}
                  className="w-full border-2 border-[#006600] bg-white px-3 py-2 text-[18px] font-bold text-center focus:outline-none focus:border-[#004400]"
                  data-ocid="search.amount.input"
                />
              </div>

              {/* New Value Preview */}
              {searchCurrentValue !== null &&
                addAmount &&
                toNum(addAmount) > 0 && (
                  <div className="mb-3 bg-[#e8ffe8] border border-[#006600] rounded-sm p-3 text-center">
                    <div className="text-[11px] text-[#004400] mb-1">
                      नया amount होगा:
                    </div>
                    <div
                      className="text-[28px] font-bold text-[#006600] leading-none"
                      data-ocid="search.new_value"
                    >
                      {(searchCurrentValue + toNum(addAmount)).toLocaleString(
                        "en-IN",
                      )}
                    </div>
                  </div>
                )}

              {/* Add Button */}
              <button
                type="button"
                onClick={handleSearchAdd}
                className="w-full bg-[#cc6600] hover:bg-[#ee8800] active:bg-[#aa4400] text-white py-3 text-[14px] font-bold border-2 border-[#884400] transition-colors"
                data-ocid="search.add_button"
              >
                ✚ Add करें
              </button>
            </div>

            {/* All Non-Zero Numbers List */}
            <div className="bg-white border border-[#c0c0c0] rounded-sm">
              <div className="bg-[#003366] text-white px-3 py-2 text-[12px] font-bold">
                📋 {t.numbersFilled} ({nonZeroEntries.length})
              </div>
              {nonZeroEntries.length === 0 ? (
                <div
                  className="text-center py-6 text-[#999] text-[12px]"
                  data-ocid="search.empty_state"
                >
                  {language === "hi"
                    ? "अभी कोई नंबर नहीं भरा"
                    : "No numbers filled yet"}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-0">
                  {nonZeroEntries.map((e, idx) => (
                    <div
                      key={e.num}
                      className={`flex items-center justify-between px-3 py-1.5 border-b border-r border-[#eee] ${
                        idx % 2 === 0 ? "bg-white" : "bg-[#f8f8f8]"
                      }`}
                      data-ocid={`search.item.${idx + 1}`}
                    >
                      <span className="text-[11px] font-bold text-[#003366]">
                        [{e.num}]
                      </span>
                      <span className="text-[12px] font-bold text-[#cc0000]">
                        {e.val.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ENTRY SCREEN ===== */}
        {screen === "entry" && (
          <div className="p-2 w-full" data-ocid="entry.section">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setScreen("gameselect")}
                className="flex items-center gap-1 bg-[#003366] text-white text-[12px] font-bold px-3 py-1.5 rounded-sm hover:bg-[#004488] active:opacity-80 transition-colors"
                data-ocid="entry.home_button"
              >
                🏠 होम
              </button>
              <span
                className="text-[12px] font-bold px-3 py-1 rounded-sm"
                style={{ backgroundColor: gameColor.bg, color: gameColor.text }}
              >
                🎮 {game}
              </span>
            </div>
            {/* Row 1 */}
            <div className="bg-white border border-[#c0c0c0] p-2 mb-1 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <label
                  htmlFor="date-input"
                  className="font-bold text-[11px] whitespace-nowrap"
                >
                  Date:
                </label>
                <input
                  id="date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border border-[#999] px-1 py-0.5 text-[11px] bg-white"
                  data-ocid="header.date.input"
                />
              </div>
              <div className="flex items-center gap-1">
                <label htmlFor="game-select" className="font-bold text-[11px]">
                  Game:
                </label>
                <select
                  id="game-select"
                  value={game}
                  onChange={(e) => setGame(e.target.value)}
                  className="border border-[#999] px-1 py-0.5 text-[11px] bg-white"
                  data-ocid="header.game.select"
                >
                  {GAMES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 border-l border-[#c0c0c0] pl-3">
                {RADIO_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="radioOption"
                      value={opt}
                      checked={radioOption === opt}
                      onChange={() => setRadioOption(opt)}
                      className="accent-[#003366]"
                      data-ocid="header.radio.toggle"
                    />
                    <span className="text-[11px]">{opt}</span>
                  </label>
                ))}
              </div>
              <div className="ml-auto border border-[#003366] px-2 py-1">
                <span className="font-bold text-[11px] text-[#003366] mr-2">
                  USER FILTER
                </span>
                <label className="inline-flex items-center gap-1 mr-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userFilter"
                    checked={userFilter === "all"}
                    onChange={() => setUserFilter("all")}
                    className="accent-[#003366]"
                    data-ocid="header.user_filter.radio"
                  />
                  <span className="text-[11px]">All Users</span>
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="userFilter"
                    checked={userFilter === "selected"}
                    onChange={() => setUserFilter("selected")}
                    className="accent-[#003366]"
                    data-ocid="header.user_filter.radio"
                  />
                  <span className="text-[11px]">Selected Users</span>
                </label>
              </div>
            </div>

            {/* Row 2 */}
            <div className="bg-white border border-[#c0c0c0] p-2 mb-2 flex items-center gap-3">
              <label
                htmlFor="party-input"
                className="font-bold text-[11px] whitespace-nowrap"
              >
                {t.selectParty}
              </label>
              <input
                id="party-input"
                type="text"
                value={party}
                onChange={(e) => setParty(e.target.value)}
                placeholder="Party name..."
                className="border-2 border-[#0066cc] bg-[#e8f0fe] px-2 py-0.5 text-[11px] w-48 focus:outline-none focus:border-[#003399]"
                data-ocid="header.party.input"
              />
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pattiSale}
                  onChange={(e) => setPattiSale(e.target.checked)}
                  className="accent-[#003366]"
                  data-ocid="header.patti_sale.checkbox"
                />
                <span className="font-bold text-[11px]">PATTI SALE</span>
              </label>
              <button
                type="button"
                onClick={handleShow}
                className="bg-[#0066cc] hover:bg-[#0088ee] text-white px-3 py-1 text-[11px] font-bold border border-[#004499]"
                data-ocid="header.show.button"
              >
                SHOW
              </button>
            </div>

            {/* Search + Add inline */}
            <div className="bg-[#fffbe6] border border-[#cc8800] p-2 mb-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-[#663300]">
                {t.searchAddLabel}
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={searchNum}
                onChange={(e) => {
                  if (/^\d{0,3}$/.test(e.target.value))
                    setSearchNum(e.target.value);
                }}
                placeholder="No. (1-100)"
                className="border border-[#cc8800] bg-white px-2 py-0.5 text-[11px] w-20 text-center focus:outline-none"
                data-ocid="entry.search.input"
              />
              {searchCurrentValue !== null && (
                <span className="text-[11px] font-bold text-[#cc0000]">
                  = {searchCurrentValue.toLocaleString("en-IN")}
                </span>
              )}
              <input
                type="text"
                inputMode="numeric"
                value={addAmount}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value))
                    setAddAmount(e.target.value);
                }}
                placeholder="Add Amount"
                className="border border-[#006600] bg-white px-2 py-0.5 text-[11px] w-24 text-center focus:outline-none"
                data-ocid="entry.add_amount.input"
              />
              <button
                type="button"
                onClick={handleSearchAdd}
                className="bg-[#cc6600] hover:bg-[#ee8800] text-white px-3 py-0.5 text-[11px] font-bold border border-[#884400]"
                data-ocid="entry.add.button"
              >
                ✚ Add
              </button>
            </div>

            {/* Cutting / Multiply options */}
            <div className="bg-white border border-[#c0c0c0] p-2 mb-1 flex flex-wrap items-center gap-3">
              <span className="font-bold text-[11px]">Cutting:</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="cuttingType"
                  checked={cuttingType === "decrease"}
                  onChange={() => setCuttingType("decrease")}
                  className="accent-[#003366]"
                  data-ocid="entry.cutting_decrease.toggle"
                />
                <span className="text-[11px]">Decrease</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="cuttingType"
                  checked={cuttingType === "increase"}
                  onChange={() => setCuttingType("increase")}
                  className="accent-[#003366]"
                  data-ocid="entry.cutting_increase.toggle"
                />
                <span className="text-[11px]">Increase</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={cuttingAmount}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value))
                    setCuttingAmount(e.target.value);
                }}
                placeholder="Amount"
                className="border border-[#999] px-2 py-0.5 text-[11px] w-20 focus:outline-none"
                data-ocid="entry.cutting_amount.input"
              />
              <span className="text-[11px]">%</span>
              <input
                type="text"
                inputMode="numeric"
                value={cuttingPercentage}
                onChange={(e) => {
                  if (/^\d*\.?\d*$/.test(e.target.value))
                    setCuttingPercentage(e.target.value);
                }}
                placeholder="%"
                className="border border-[#999] px-2 py-0.5 text-[11px] w-16 focus:outline-none"
                data-ocid="entry.cutting_percentage.input"
              />
              <span className="text-[11px] ml-2">Multiply N:</span>
              <input
                type="text"
                inputMode="numeric"
                value={multiplyN}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value))
                    setMultiplyN(e.target.value);
                }}
                placeholder="N"
                className="border border-[#999] px-2 py-0.5 text-[11px] w-16 focus:outline-none"
                data-ocid="entry.multiply_n.input"
              />
              <label className="flex items-center gap-1 cursor-pointer ml-auto">
                <input
                  type="checkbox"
                  checked={highColor}
                  onChange={(e) => setHighColor(e.target.checked)}
                  className="accent-[#cc0000]"
                  data-ocid="entry.high_color.checkbox"
                />
                <span className="text-[11px] font-bold text-[#cc0000]">
                  High Color
                </span>
              </label>
            </div>

            {/* Main Grid */}
            <div className="bg-white border border-[#cc3300] mb-1 w-full overflow-x-auto">
              <table
                className="border-collapse"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <colgroup>
                  {COLS.map((c) => (
                    <col key={c} style={{ width: "8.5%" }} />
                  ))}
                  <col style={{ width: "15%" }} />
                </colgroup>
                <thead>
                  <tr
                    className="text-white"
                    style={{ backgroundColor: gameColor.bg }}
                  >
                    {COL_HEADERS.map((h) => (
                      <th
                        key={h}
                        className="border border-[#cc6600] text-center text-[10px] py-0.5"
                      >
                        {h}
                      </th>
                    ))}
                    <th className="border border-[#cc6600] text-center text-[10px] py-0.5 opacity-80">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={`row-${row}`}>
                      {COLS.map((col) => {
                        const idx = row * 10 + col;
                        const isHighlighted = searchIndex === idx;
                        return (
                          <td
                            key={`cell-${idx}`}
                            className={`border border-[#cc3300] p-0 relative ${isHighlighted ? "bg-[#fffbe6] ring-2 ring-[#cc8800] ring-inset" : ""}`}
                            style={{ height: "38px" }}
                          >
                            <span
                              className={`absolute top-0 left-0.5 text-[8px] font-bold leading-none ${isHighlighted ? "text-[#cc6600]" : "text-[#cc3300]"}`}
                            >
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={values[idx]}
                              onChange={(e) =>
                                handleMainChange(idx, e.target.value)
                              }
                              className="w-full h-full pt-3 pb-0.5 text-center text-[12px] font-bold bg-transparent focus:bg-[#fffbe6] focus:outline-none border-none"
                              data-ocid={`grid.item.${idx + 1}`}
                            />
                          </td>
                        );
                      })}
                      <td className="border border-[#cc3300] text-center text-[11px] font-bold text-[#003366] bg-[#f0f4ff]">
                        {fmt(rowTotals[row])}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#fff3e0]">
                    {COL_HEADERS.map((h, c) => (
                      <td
                        key={h}
                        className="border border-[#cc3300] text-center text-[11px] font-bold text-[#cc3300] py-0.5"
                      >
                        {fmt(colTotals[c])}
                      </td>
                    ))}
                    <td className="border border-[#cc3300] text-center text-[11px] font-bold text-[#003366] bg-[#f0f4ff]" />
                  </tr>
                </tbody>
              </table>
            </div>

            {/* B Section bottom */}
            <div className="bg-white border border-[#cc3300] mt-1 w-full overflow-x-auto">
              <table
                className="border-collapse"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <colgroup>
                  <col style={{ width: "5%" }} />
                  {B_LABELS.map((l) => (
                    <col key={l} style={{ width: "7.8%" }} />
                  ))}
                  <col style={{ width: "12%" }} />
                </colgroup>
                <thead>
                  <tr
                    className="text-white"
                    style={{ backgroundColor: gameColor.bg }}
                  >
                    <th className="border border-[#cc6600] text-center text-[10px] py-0.5">
                      B
                    </th>
                    {B_LABELS.map((lbl) => (
                      <th
                        key={lbl}
                        className="border border-[#cc6600] text-center text-[10px] py-0.5"
                      >
                        {lbl}
                      </th>
                    ))}
                    <th className="border border-[#cc6600] text-center text-[10px] py-0.5 opacity-80">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#cc3300] bg-[#f0f4ff]" />
                    {B_LABELS.map((lbl, i) => (
                      <td
                        key={`b2-${lbl}`}
                        className="border border-[#cc3300] p-0 relative"
                        style={{ height: "38px" }}
                      >
                        <span className="absolute top-0 left-0.5 text-[8px] text-[#cc3300] font-bold leading-none">
                          {lbl}
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={bValues[i]}
                          onChange={(e) => handleBChange(i, e.target.value)}
                          className="w-full h-full pt-3 pb-0.5 text-center text-[12px] font-bold bg-transparent focus:bg-[#fffbe6] focus:outline-none border-none"
                          data-ocid={`bsection2.item.${i + 1}`}
                        />
                      </td>
                    ))}
                    <td className="border border-[#cc3300] text-center text-[11px] font-bold text-[#003366] bg-[#f0f4ff]">
                      {fmt(bTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* A Section bottom */}
            <div className="bg-white border border-[#cc3300] mt-1 w-full overflow-x-auto">
              <table
                className="border-collapse"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <colgroup>
                  <col style={{ width: "5%" }} />
                  {A_LABELS.map((l) => (
                    <col key={l} style={{ width: "7.8%" }} />
                  ))}
                  <col style={{ width: "12%" }} />
                </colgroup>
                <thead>
                  <tr
                    className="text-white"
                    style={{ backgroundColor: gameColor.bg }}
                  >
                    <th className="border border-[#cc6600] text-center text-[10px] py-0.5">
                      A
                    </th>
                    {A_LABELS.map((lbl) => (
                      <th
                        key={lbl}
                        className="border border-[#cc6600] text-center text-[10px] py-0.5"
                      >
                        {lbl}
                      </th>
                    ))}
                    <th className="border border-[#cc6600] text-center text-[10px] py-0.5 opacity-80">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#cc3300] bg-[#f0f4ff]" />
                    {A_LABELS.map((lbl, i) => (
                      <td
                        key={`a2-${lbl}`}
                        className="border border-[#cc3300] p-0 relative"
                        style={{ height: "38px" }}
                      >
                        <span className="absolute top-0 left-0.5 text-[8px] text-[#cc3300] font-bold leading-none">
                          {lbl}
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={aValues[i]}
                          onChange={(e) => handleAChange(i, e.target.value)}
                          className="w-full h-full pt-3 pb-0.5 text-center text-[12px] font-bold bg-transparent focus:bg-[#fffbe6] focus:outline-none border-none"
                          data-ocid={`asection2.item.${i + 1}`}
                        />
                      </td>
                    ))}
                    <td className="border border-[#cc3300] text-center text-[11px] font-bold text-[#003366] bg-[#f0f4ff]">
                      {fmt(aTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Save / Grand Total row */}
            <div className="bg-white border border-[#c0c0c0] p-2 flex items-center gap-3 mt-1">
              <span
                className="font-bold text-[13px] text-[#cc0000]"
                data-ocid="grand_total.section"
              >
                {t.grandTotal} : {grandTotal.toLocaleString("en-IN")}
              </span>
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="bg-[#006600] text-white px-5 py-1 text-[12px] font-bold hover:bg-[#008800] active:bg-[#004400] border border-[#004400] disabled:opacity-60"
                data-ocid="save.submit_button"
              >
                {saveMutation.isPending ? t.saving : t.save}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t.confirmClear)) {
                    setValues(Array(100).fill(""));
                    setBValues(Array(10).fill(""));
                    setAValues(Array(10).fill(""));
                  }
                }}
                className="bg-[#cc0000] text-white px-3 py-1 text-[12px] font-bold hover:bg-[#ee0000] active:bg-[#aa0000] border border-[#880000]"
                data-ocid="clear.amount_button"
              >
                {t.clearAll}
              </button>
            </div>

            <footer className="text-center text-[10px] text-[#666] py-2 mt-4 border-t border-[#c0c0c0]">
              © {currentYear}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#003366] hover:underline"
              >
                caffeine.ai
              </a>
            </footer>
          </div>
        )}
      </div>

      {/* ===== SETTINGS SCREEN ===== */}
      {screen === "settings" && (
        <div className="p-4" data-ocid="settings.section">
          <div className="text-center mb-6">
            <div className="text-[22px] font-bold text-[#003366] mb-1">
              {t.settingsTitle}
            </div>
          </div>

          {/* Language Setting */}
          <div className="bg-white border border-[#c0c0c0] rounded-sm p-4 mb-4 shadow-sm">
            <div className="text-[14px] font-bold text-[#003366] mb-4 pb-2 border-b border-[#e0e0e0]">
              🌐 {t.language}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => changeLanguage("hi")}
                className={`flex-1 py-3 px-4 text-[14px] font-bold rounded-sm border-2 transition-all ${
                  language === "hi"
                    ? "bg-[#003366] text-white border-[#003366]"
                    : "bg-white text-[#003366] border-[#c0c0c0] hover:border-[#003366]"
                }`}
                data-ocid="settings.hindi.button"
              >
                🇮🇳 {t.langHi}
                {language === "hi" && (
                  <span className="ml-2 text-[#ffcc44]">✓</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => changeLanguage("en")}
                className={`flex-1 py-3 px-4 text-[14px] font-bold rounded-sm border-2 transition-all ${
                  language === "en"
                    ? "bg-[#003366] text-white border-[#003366]"
                    : "bg-white text-[#003366] border-[#c0c0c0] hover:border-[#003366]"
                }`}
                data-ocid="settings.english.button"
              >
                🇬🇧 {t.langEn}
                {language === "en" && (
                  <span className="ml-2 text-[#ffcc44]">✓</span>
                )}
              </button>
            </div>
          </div>

          <footer className="text-center text-[10px] text-[#666] py-4 mt-6 border-t border-[#c0c0c0]">
            © {currentYear}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#003366] hover:underline"
            >
              caffeine.ai
            </a>
          </footer>
        </div>
      )}

      {/* ===== CHAT SCREEN ===== */}
      {screen === "chat" && (
        <div className="p-3" data-ocid="chat.section">
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setScreen("home")}
              className="flex items-center gap-1 bg-[#003366] text-white text-[12px] font-bold px-3 py-1.5 rounded-sm hover:bg-[#004488] transition-colors"
              data-ocid="chat.home_button"
            >
              🏠 {language === "hi" ? "होम" : "Home"}
            </button>
            <span
              className="text-[13px] font-bold px-3 py-1 rounded-sm"
              style={{ backgroundColor: gameColor.bg, color: gameColor.text }}
            >
              🎮 {game}
            </span>
          </div>

          <div className="bg-[#e8f0ff] border-2 border-[#003366] rounded-sm p-4 mb-3">
            <div className="text-[14px] font-bold text-[#003366] mb-2">
              💬 {language === "hi" ? "स्मार्ट चैट एंट्री" : "Smart Chat Entry"}
            </div>
            <div className="text-[11px] text-[#555] mb-3">
              {language === "hi"
                ? "नीचे नंबर और amount टाइप करें। जैसे: 5-500 10-200 या 5 500, 10 200"
                : "Type number and amount below. E.g.: 5-500 10-200 or 5 500, 10 200"}
            </div>
            <textarea
              value={chatInput}
              onChange={(e) => {
                setChatInput(e.target.value);
                setChatParsed(parseChatInput(e.target.value));
              }}
              placeholder={
                language === "hi"
                  ? "यहाँ टाइप करें...\nजैसे: 5-500 10-200 25-1500"
                  : "Type here...\nE.g.: 5-500 10-200 25-1500"
              }
              className="w-full border-2 border-[#003366] bg-white px-3 py-2 text-[13px] font-mono focus:outline-none focus:border-[#0055aa] min-h-[120px] resize-y"
              data-ocid="chat.input"
            />
          </div>

          {chatParsed.length > 0 && (
            <div
              className="bg-white border-2 border-[#00aa00] rounded-sm p-3 mb-3"
              data-ocid="chat.preview"
            >
              <div className="text-[12px] font-bold text-[#006600] mb-2">
                ✅{" "}
                {language === "hi"
                  ? `${chatParsed.length} एंट्री मिलीं:`
                  : `${chatParsed.length} entries found:`}
              </div>
              <div className="max-h-[180px] overflow-y-auto">
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-[#e8ffe8]">
                      <th className="border border-[#88cc88] px-2 py-1 text-left text-[#006600]">
                        {language === "hi" ? "नंबर" : "Number"}
                      </th>
                      <th className="border border-[#88cc88] px-2 py-1 text-left text-[#006600]">
                        {language === "hi" ? "अभी का" : "Current"}
                      </th>
                      <th className="border border-[#88cc88] px-2 py-1 text-left text-[#006600]">
                        {language === "hi" ? "जोड़ें" : "Add"}
                      </th>
                      <th className="border border-[#88cc88] px-2 py-1 text-left text-[#006600]">
                        {language === "hi" ? "नया" : "New"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chatParsed.map(({ num, amount }) => {
                      const current = toNum(values[num - 1]);
                      return (
                        <tr key={num} className="hover:bg-[#f0fff0]">
                          <td className="border border-[#c0c0c0] px-2 py-1 font-bold text-[#003366]">
                            [{num}]
                          </td>
                          <td className="border border-[#c0c0c0] px-2 py-1 text-[#666]">
                            {current || 0}
                          </td>
                          <td className="border border-[#c0c0c0] px-2 py-1 text-[#cc6600] font-bold">
                            +{amount}
                          </td>
                          <td className="border border-[#c0c0c0] px-2 py-1 font-bold text-[#006600]">
                            {current + amount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={() => {
                  setValues((prev) => {
                    const next = [...prev];
                    for (const { num, amount } of chatParsed) {
                      const idx = num - 1;
                      next[idx] = String(toNum(next[idx]) + amount);
                    }
                    return next;
                  });
                  toast.success(
                    language === "hi"
                      ? `${chatParsed.length} नंबर में amount जोड़ दिया!`
                      : `Added amount to ${chatParsed.length} numbers!`,
                  );
                  setChatInput("");
                  setChatParsed([]);
                }}
                className="mt-3 w-full bg-[#006600] hover:bg-[#008800] text-white font-bold py-2.5 text-[14px] rounded-sm transition-colors"
                data-ocid="chat.add_button"
              >
                ✚ {language === "hi" ? "सभी जोड़ें" : "Add All"}
              </button>
            </div>
          )}

          {chatInput.length > 0 && chatParsed.length === 0 && (
            <div
              className="bg-[#fff3cd] border border-[#cc8800] rounded-sm p-3 text-[12px] text-[#663300]"
              data-ocid="chat.no_match"
            >
              {language === "hi"
                ? "⚠️ कोई नंबर-amount pair नहीं मिला। Format: 5-500 या 5 500"
                : "⚠️ No number-amount pairs found. Format: 5-500 or 5 500"}
            </div>
          )}

          <div className="mt-4 bg-white border border-[#c0c0c0] rounded-sm p-3 text-center">
            <div className="text-[11px] text-[#666]">Grand Total ({game})</div>
            <div className="text-[28px] font-bold text-[#cc0000]">
              {grandTotal.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      )}

      {/* ===== BOTTOM NAV BAR ===== */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#c0c0c0] flex z-40">
        <button
          type="button"
          onClick={() => setScreen("gameselect")}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
            screen === "gameselect"
              ? "bg-[#003366] text-white"
              : "text-[#555] hover:bg-[#f0f0f0]"
          }`}
          data-ocid="nav.home.tab"
        >
          <span className="text-[18px] leading-none">🏠</span>
          <span className="text-[10px] font-bold">{t.home}</span>
        </button>
        <button
          type="button"
          onClick={() => setScreen("search")}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
            screen === "search"
              ? "bg-[#003366] text-white"
              : "text-[#555] hover:bg-[#f0f0f0]"
          }`}
          data-ocid="nav.search.tab"
        >
          <span className="text-[18px] leading-none">🔍</span>
          <span className="text-[10px] font-bold">{t.search}</span>
        </button>
        <button
          type="button"
          onClick={() => setScreen("entry")}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
            screen === "entry"
              ? "bg-[#003366] text-white"
              : "text-[#555] hover:bg-[#f0f0f0]"
          }`}
          data-ocid="nav.entry.tab"
        >
          <span className="text-[18px] leading-none">📝</span>
          <span className="text-[10px] font-bold">{t.entry}</span>
        </button>
        <button
          type="button"
          onClick={() => setScreen("settings")}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
            screen === "settings"
              ? "bg-[#003366] text-white"
              : "text-[#555] hover:bg-[#f0f0f0]"
          }`}
          data-ocid="nav.settings.tab"
        >
          <span className="text-[18px] leading-none">⚙️</span>
          <span className="text-[10px] font-bold">{t.settings}</span>
        </button>
        <button
          type="button"
          onClick={() => setScreen("chat")}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
            screen === "chat"
              ? "bg-[#003366] text-white"
              : "text-[#555] hover:bg-[#f0f0f0]"
          }`}
          data-ocid="nav.chat.tab"
        >
          <span className="text-[18px] leading-none">💬</span>
          <span className="text-[10px] font-bold">
            {language === "hi" ? "चैट" : "Chat"}
          </span>
        </button>
      </div>
    </div>
  );
}
