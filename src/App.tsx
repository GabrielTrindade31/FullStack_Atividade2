import React from "react";
import { useForm } from "react-hook-form";
import InputField from "./components/InputField";
import ResultRow from "./components/ResultRow";

type FormValues = { firstName: string; lastName: string; email: string; day: string; month: string; year: string };

function isLeap(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function maxDaysInMonth(month: number, year: number) {
  if (month === 2) return isLeap(year) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

function differenceYMD(from: Date, to: Date) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  return { years, months, days };
}

function nowInTZ(tz: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value || 0);
  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour");
  const minute = get("minute");
  return {
    date: new Date(year, month - 1, day, hour, minute, 0, 0),
    clock: { hour, minute }
  };
}

function useBrasiliaNow() {
  const [state, setState] = React.useState(() => nowInTZ("America/Sao_Paulo"));
  React.useEffect(() => {
    const id = setInterval(() => setState(nowInTZ("America/Sao_Paulo")), 60_000);
    return () => clearInterval(id);
  }, []);
  return state;
}

function useTheme() {
  const [theme, setTheme] = React.useState<"light" | "dark">(() => (localStorage.getItem("theme") as any) || "light");
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark"); else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  return { theme, setTheme };
}

export default function App() {
  const { date: today, clock } = useBrasiliaNow();
  const { theme, setTheme } = useTheme();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitSuccessful },
    watch,
    reset
  } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: { firstName: "", lastName: "", email: "", day: "", month: "", year: "" }
  });

  const values = watch();
  const birthDate = React.useMemo(() => {
    const d = parseInt(values.day, 10);
    const m = parseInt(values.month, 10);
    const y = parseInt(values.year, 10);
    if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return null;
    if (y < 0 || m < 1 || m > 12) return null;
    const md = maxDaysInMonth(m, y);
    if (d < 1 || d > md) return null;
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }, [values.day, values.month, values.year]);

  const onSubmit = () => {
    clearErrors();
    if (!birthDate) {
      setError("root", { type: "manual", message: "Data inválida." });
      return;
    }
    if (birthDate > today) {
      setError("root", { type: "manual", message: "A data deve ser no passado." });
      return;
    }
  };

  const result = React.useMemo(() => {
    if (!birthDate || birthDate > today) return null;
    return differenceYMD(birthDate, today);
  }, [birthDate, today]);

  const fullName = (values.firstName?.trim() + " " + values.lastName?.trim()).trim();

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 dark:bg-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="max-w-3xl mx-auto p-6">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Calculadora de Idade</h1>
          </div>
          <button
            aria-label="Alternar tema"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-xl border border-gray-300 dark:border-neutral-700 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800"
          >
            {theme === "dark" ? "Tema claro" : "Tema escuro"}
          </button>
        </header>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow p-6 ring-1 ring-black/5 dark:ring-white/10">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="NOME"
                name="firstName"
                placeholder="Seu nome"
                register={register("firstName", {
                  required: "Informe o nome",
                  minLength: { value: 2, message: "Mínimo 2 letras" }
                })}
                errors={errors as any}
              />
              <InputField
                label="SOBRENOME"
                name="lastName"
                placeholder="Seu sobrenome"
                register={register("lastName", {
                  required: "Informe o sobrenome",
                  minLength: { value: 2, message: "Mínimo 2 letras" }
                })}
                errors={errors as any}
              />
              <InputField
                label="EMAIL"
                name="email"
                placeholder="voce@email.com"
                register={register("email", {
                  required: "Informe o email",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" }
                })}
                errors={errors as any}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <InputField
                label="DIA"
                name="day"
                maxLength={2}
                placeholder="DD"
                register={register("day", {
                  required: "Informe o dia",
                  validate: (v) => {
                    const n = parseInt(v, 10);
                    if (!/^[0-9]{1,2}$/.test(v)) return "Somente números";
                    if (!(n >= 1 && n <= 31)) return "Dia inválido";
                    const m = parseInt(values.month, 10);
                    const y = parseInt(values.year, 10);
                    if (m && y) {
                      const md = maxDaysInMonth(m, y);
                      if (n > md) return `Máx: ${md} dias`;
                    }
                    return true;
                  }
                })}
                errors={errors as any}
              />
              <InputField
                label="MÊS"
                name="month"
                maxLength={2}
                placeholder="MM"
                register={register("month", {
                  required: "Informe o mês",
                  validate: (v) => {
                    const n = parseInt(v, 10);
                    if (!/^[0-9]{1,2}$/.test(v)) return "Somente números";
                    if (!(n >= 1 && n <= 12)) return "Mês inválido";
                    return true;
                  }
                })}
                errors={errors as any}
              />
              <InputField
                label="ANO"
                name="year"
                maxLength={4}
                placeholder="AAAA"
                register={register("year", {
                  required: "Informe o ano",
                  validate: (v) => {
                    if (!/^[0-9]{4}$/.test(v)) return "Use 4 dígitos";
                    const n = parseInt(v, 10);
                    if (n < 1900) return "Ano muito antigo";
                    if (n > new Date().getFullYear()) return "Futuro não permitido";
                    return true;
                  }
                })}
                errors={errors as any}
              />
            </div>

            {errors.root?.message && (
              <div className="rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-3 py-2 text-sm">
                {errors.root.message as string}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-sm"
              >
                Calcular
              </button>
              <button
                type="button"
                onClick={() => { reset({ firstName: "", lastName: "", email: "", day: "", month: "", year: "" }); }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition"
              >
                Limpar
              </button>
              <div className="ml-auto text-sm text-gray-600 dark:text-neutral-300">
                Horário de Brasília: {String(clock.hour).padStart(2, "0")}:{String(clock.minute).padStart(2, "0")}
              </div>
            </div>
          </form>

          <hr className="my-6 border-gray-200 dark:border-neutral-700" />

          <section className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-4 items-end">
            <ResultRow value={result ? result.years : "--"} unit="anos" />
            <ResultRow value={result ? result.months : "--"} unit="meses" />
            <ResultRow value={result ? result.days : "--"} unit="dias" />
          </section>

          {isSubmitSuccessful && result && (
            <p className="mt-4 text-lg">
              {fullName ? <strong>{fullName}</strong> : "A pessoa"} tem {result.years} anos, {result.months} meses e {result.days} dias.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
