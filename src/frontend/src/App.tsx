import { Toaster } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
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

function toNum(v: string): number {
  const n = Number.parseFloat(v);
  return Number.isNaN(n) ? 0 : n;
}

function fmt(n: number): string {
  return n === 0 ? "" : String(n);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateToTime(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime() * 1_000_000);
}

function nsToDateStr(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function App() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  const [date, setDate] = useState(todayStr());
  const [game, setGame] = useState<string>("DS");
  const [radioOption, setRadioOption] = useState<string>("Daily Collection");
  const [userFilter, setUserFilter] = useState<"all" | "selected">("all");
  const [party, setParty] = useState("");
  const [pattiSale, setPattiSale] = useState(false);
  const [values, setValues] = useState<string[]>(Array(100).fill(""));
  const [bValues, setBValues] = useState<string[]>(Array(10).fill(""));
  const [aValues, setAValues] = useState<string[]>(Array(10).fill(""));
  const [cuttingType, setCuttingType] = useState<"decrease" | "increase">(
    "decrease",
  );
  const [cuttingAmount, setCuttingAmount] = useState("");
  const [cuttingPercentage, setCuttingPercentage] = useState("");
  const [multiplyN, setMultiplyN] = useState("");
  const [highColor, setHighColor] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Search + Add state
  const [searchNum, setSearchNum] = useState("");
  const [addAmount, setAddAmount] = useState("");

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
      toast.error("Sahi number daalen (1 se 100 ke beech)");
      return;
    }
    const addVal = toNum(addAmount);
    if (addVal === 0) {
      toast.error("Add karne ki amount daalen");
      return;
    }
    setValues((prev) => {
      const next = [...prev];
      const current = toNum(next[searchIndex]);
      next[searchIndex] = String(current + addVal);
      return next;
    });
    toast.success(`Number ${searchNum} mein ${addVal} add ho gaya!`);
    setAddAmount("");
  }, [searchIndex, addAmount, searchNum]);

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

  // History query
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({
      date: d,
      game: g,
      party: p,
    }: {
      date: bigint;
      game: string;
      party: string;
    }) => {
      if (!actor) throw new Error("Backend connect nahi hua");
      await actor.deleteData(d, g, p);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      toast.success("Record delete ho gaya!");
    },
    onError: () => toast.error("Delete nahi hua, dobara try karein"),
  });

  const handleShow = async () => {
    if (!party) {
      toast.error("Party name daalen");
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
      if (!actor) throw new Error("Backend se connect nahi hua");
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
    onSuccess: () => toast.success("Data save ho gaya!"),
    onError: (e) => toast.error(`Save nahi hua: ${e}`),
  });

  return (
    <div className="min-h-screen bg-[#f0f0f0] font-mono text-xs w-full">
      <Toaster />
      <div className="bg-[#003366] text-white px-3 py-1 flex items-center justify-between">
        <span className="font-bold text-sm">Lottery Collection Entry</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowHistory(true);
              refetchHistory();
            }}
            className="bg-[#cc8800] hover:bg-[#ffaa00] text-white text-[11px] font-bold px-3 py-0.5 border border-[#ffcc44] rounded-sm transition-colors"
            data-ocid="history.open_modal_button"
          >
            📋 इतिहास
          </button>
          <span className="text-[10px] opacity-70">v2.0</span>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto"
          data-ocid="history.modal"
        >
          <div className="bg-white w-full max-w-2xl my-4 mx-2 shadow-2xl rounded-sm">
            <div className="bg-[#003366] text-white px-4 py-2 flex items-center justify-between">
              <span className="font-bold text-sm">📋 इतिहास (History)</span>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="text-white hover:text-[#ffcc44] text-lg font-bold leading-none px-1"
                data-ocid="history.close_button"
              >
                ✕ बंद करें
              </button>
            </div>
            <div className="p-3">
              {historyLoading ? (
                <div
                  className="text-center py-8 text-[#003366] font-bold text-sm"
                  data-ocid="history.loading_state"
                >
                  लोड हो रहा है...
                </div>
              ) : !historyData || historyData.length === 0 ? (
                <div
                  className="text-center py-8 text-[#666] text-sm"
                  data-ocid="history.empty_state"
                >
                  कोई इतिहास नहीं
                </div>
              ) : (
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
                      {historyData.map((entry, idx) => {
                        const total = entry.numbers.reduce(
                          (s, v) => s + Number(v),
                          0,
                        );
                        return (
                          <tr
                            key={`${entry.date}-${entry.game}-${entry.party}`}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-[#f5f8ff]"
                            }
                            data-ocid={`history.item.${idx + 1}`}
                          >
                            <td className="border border-[#c0c0c0] px-2 py-1">
                              {nsToDateStr(entry.date)}
                            </td>
                            <td className="border border-[#c0c0c0] px-2 py-1 font-bold text-[#003366]">
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
                                disabled={deleteMutation.isPending}
                                className="bg-[#cc0000] hover:bg-[#ee0000] text-white px-2 py-0.5 text-[10px] font-bold border border-[#880000] disabled:opacity-50"
                                data-ocid={`history.delete_button.${idx + 1}`}
                              >
                                🗑 हटाएं
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-2 w-full">
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
            Select Party:
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
            className="bg-[#003366] text-white px-4 py-0.5 text-[11px] font-bold hover:bg-[#004488] active:bg-[#002244] border border-[#001133]"
            data-ocid="header.show.button"
          >
            Show
          </button>
        </div>

        {/* Search + Add Section */}
        <div
          className="bg-[#fffbe6] border-2 border-[#cc8800] p-2 mb-2 w-full"
          data-ocid="search_add.section"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-[11px] text-[#cc6600] whitespace-nowrap">
              🔍 नंबर खोजें और जोड़ें:
            </span>
            <div className="flex items-center gap-1">
              <label
                htmlFor="search-num"
                className="text-[11px] font-bold whitespace-nowrap"
              >
                नंबर (1-100):
              </label>
              <input
                id="search-num"
                type="text"
                inputMode="numeric"
                value={searchNum}
                onChange={(e) => {
                  if (/^\d{0,3}$/.test(e.target.value))
                    setSearchNum(e.target.value);
                }}
                placeholder="जैसे: 20"
                className="border-2 border-[#cc8800] bg-white px-2 py-0.5 text-[12px] font-bold w-20 text-center focus:outline-none focus:border-[#cc6600]"
                data-ocid="search_add.number.input"
              />
            </div>
            {searchCurrentValue !== null && (
              <div className="flex items-center gap-1 bg-[#fff3cd] border border-[#cc8800] px-2 py-0.5">
                <span className="text-[11px] font-bold text-[#663300]">
                  अभी का amount:
                </span>
                <span
                  className="text-[13px] font-bold text-[#cc0000]"
                  data-ocid="search_add.current_value"
                >
                  {searchCurrentValue.toLocaleString("en-IN")}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <label
                htmlFor="add-amount"
                className="text-[11px] font-bold whitespace-nowrap"
              >
                Add Amount:
              </label>
              <input
                id="add-amount"
                type="text"
                inputMode="numeric"
                value={addAmount}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value))
                    setAddAmount(e.target.value);
                }}
                placeholder="जोड़ने की राशि"
                className="border-2 border-[#006600] bg-white px-2 py-0.5 text-[12px] font-bold w-28 text-center focus:outline-none focus:border-[#004400]"
                data-ocid="search_add.amount.input"
              />
            </div>
            {searchCurrentValue !== null &&
              addAmount &&
              toNum(addAmount) > 0 && (
                <div className="flex items-center gap-1 bg-[#e8ffe8] border border-[#006600] px-2 py-0.5">
                  <span className="text-[11px] font-bold text-[#004400]">
                    नया amount:
                  </span>
                  <span
                    className="text-[13px] font-bold text-[#006600]"
                    data-ocid="search_add.new_value"
                  >
                    {(searchCurrentValue + toNum(addAmount)).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
              )}
            <button
              type="button"
              onClick={handleSearchAdd}
              className="bg-[#cc6600] hover:bg-[#ee8800] text-white px-4 py-1 text-[11px] font-bold border border-[#884400] active:bg-[#aa4400] whitespace-nowrap"
              data-ocid="search_add.add_button"
            >
              ✚ Add करें
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="bg-white border border-[#cc3300] w-full overflow-x-auto">
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
              <tr className="bg-[#003366] text-white">
                {COL_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="border border-[#cc6600] text-center text-[10px] py-0.5"
                  >
                    {h}
                  </th>
                ))}
                <th className="border border-[#cc6600] text-center text-[10px] py-0.5 bg-[#004488]">
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

        {/* B Section */}
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
              <tr className="bg-[#003366] text-white">
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
                <th className="border border-[#cc6600] text-center text-[10px] py-0.5 bg-[#004488]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-[#cc3300] bg-[#f0f4ff]" />
                {B_LABELS.map((lbl, i) => (
                  <td
                    key={lbl}
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
                      data-ocid={`bsection.item.${i + 1}`}
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

        {/* A Section */}
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
              <tr className="bg-[#003366] text-white">
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
                <th className="border border-[#cc6600] text-center text-[10px] py-0.5 bg-[#004488]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-[#cc3300] bg-[#f0f4ff]" />
                {A_LABELS.map((lbl, i) => (
                  <td
                    key={lbl}
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
                      data-ocid={`asection.item.${i + 1}`}
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

        {/* Bottom Controls */}
        <div className="flex flex-wrap items-start justify-between mt-2 gap-2">
          <div className="bg-white border border-[#c0c0c0] p-2 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[11px] text-[#003366]">
                Cutting:
              </span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="cuttingType"
                  checked={cuttingType === "decrease"}
                  onChange={() => setCuttingType("decrease")}
                  className="accent-[#003366]"
                  data-ocid="cutting.decrease.radio"
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
                  data-ocid="cutting.increase.radio"
                />
                <span className="text-[11px]">Increase</span>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold">AMOUNT:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cuttingAmount}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value))
                      setCuttingAmount(e.target.value);
                  }}
                  className="border border-[#999] w-16 px-1 py-0.5 text-[11px] text-center"
                  data-ocid="cutting.amount.input"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold">%AGE:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cuttingPercentage}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value))
                      setCuttingPercentage(e.target.value);
                  }}
                  className="border border-[#999] w-14 px-1 py-0.5 text-[11px] text-center"
                  data-ocid="cutting.percentage.input"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 border-l border-[#c0c0c0] pl-3">
              <span className="font-bold text-[11px] text-[#003366]">
                Multiply:
              </span>
              <span className="text-[11px]">Multiply N:</span>
              <input
                type="text"
                inputMode="numeric"
                value={multiplyN}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value))
                    setMultiplyN(e.target.value);
                }}
                className="border border-[#999] w-16 px-1 py-0.5 text-[11px] text-center"
                data-ocid="multiply.input"
              />
            </div>
            <div className="flex items-center gap-2 border-l border-[#c0c0c0] pl-3">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highColor}
                  onChange={(e) => setHighColor(e.target.checked)}
                  className="accent-[#cc3300]"
                  data-ocid="high_color.checkbox"
                />
                <span className="font-bold text-[11px] text-[#cc3300]">
                  High Color
                </span>
              </label>
            </div>
          </div>

          <div className="bg-white border border-[#c0c0c0] p-2 flex items-center gap-3">
            <span
              className="font-bold text-[13px] text-[#cc0000]"
              data-ocid="grand_total.section"
            >
              Grand Total : {grandTotal.toLocaleString("en-IN")}
            </span>
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="bg-[#006600] text-white px-5 py-1 text-[12px] font-bold hover:bg-[#008800] active:bg-[#004400] border border-[#004400] disabled:opacity-60"
              data-ocid="save.submit_button"
            >
              {saveMutation.isPending ? "Saving..." : "SAVE"}
            </button>
          </div>
        </div>
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
  );
}
