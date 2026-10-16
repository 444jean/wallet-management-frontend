import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Label, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Plus, TrendingUp } from "lucide-react";
import { CATEGORY_COLORS, currencyTooltip } from "@/components/common/chart-helpers";
import { SalaryCard } from "@/components/salary/SalaryCard";
import { SavedSummaryCard } from "@/components/savings/SavedSummaryCard";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { TransactionAmount, TransactionIcon } from "@/components/transactions/TransactionParts";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useFinance } from "@/hooks/use-finance";
import { sortByDateDesc, useStats } from "@/hooks/use-stats";
import { authClient } from "@/lib/auth-client";
import { dayLabel } from "@/lib/dates";
import { formatCompactCurrency, formatCurrency, formatMonth } from "@/lib/utils";

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const flowConfig = {
  income: { label: "Ingresos", color: "var(--income)" },
  expense: { label: "Gastos", color: "var(--expense)" },
} satisfies ChartConfig;

function MonthStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof ArrowUpRight;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-primary-foreground/10 p-3">
      <p className="flex items-center gap-1 text-[11px] opacity-80 sm:text-xs">
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </p>
      <p className="mt-1 truncate text-sm font-semibold tabular-nums sm:text-base">
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function BalanceHero() {
  const stats = useStats();
  return (
    <Card className="gap-4 border-0 bg-gradient-to-br from-primary to-primary/80 py-5 text-primary-foreground shadow-lg shadow-primary/20">
      <CardContent className="space-y-4 px-5">
        <div>
          <p className="text-sm opacity-80">Balance total</p>
          <p className="text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
            {formatCurrency(stats.balance)}
          </p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs opacity-80">Este mes</p>
          <div className="grid grid-cols-3 gap-2">
            <MonthStat label="Ingresos" value={stats.monthIncome} icon={ArrowUpRight} />
            <MonthStat label="Gastos" value={stats.monthExpense} icon={ArrowDownLeft} />
            <MonthStat label="Ahorro" value={stats.monthBalance} icon={TrendingUp} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FlowChart() {
  const { months } = useStats();
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Ingresos vs gastos</CardTitle>
        <CardDescription>Últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer config={flowConfig} className="aspect-auto h-60 w-full md:h-72 lg:h-96">
          <BarChart data={months} barGap={4} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(v: number) => formatCompactCurrency(v)}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.5 }}
              content={<ChartTooltipContent formatter={currencyTooltip(flowConfig)} />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function CategoryChart() {
  const { categorySlices, monthExpense } = useStats();
  const data = categorySlices.map((s, i) => ({
    ...s,
    fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));
  const config = Object.fromEntries(
    data.map((s) => [s.category, { label: s.category, color: s.fill }]),
  ) satisfies ChartConfig;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Gastos por categoría</CardTitle>
        <CardDescription>{formatMonth(new Date())}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Sin gastos este mes.</p>
        ) : (
          <div className="space-y-4">
            <ChartContainer config={config} className="mx-auto aspect-square h-52">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="category" formatter={currencyTooltip(config)} />}
                />
                <Pie data={data} dataKey="total" nameKey="category" innerRadius={62} outerRadius={88} paddingAngle={2} strokeWidth={0}>
                  {data.map((s) => (
                    <Cell key={s.category} fill={s.fill} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox)) return null;
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 8} className="fill-foreground text-lg font-bold">
                            {formatCompactCurrency(monthExpense)}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 14} className="fill-muted-foreground text-xs">
                            gastado
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="space-y-2.5">
              {data.slice(0, 5).map((s) => {
                const pct = monthExpense > 0 ? Math.round((s.total / monthExpense) * 100) : 0;
                return (
                  <li key={s.category} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.fill }} />
                        <span className="truncate">{s.category}</span>
                      </span>
                      <span className="shrink-0 font-medium tabular-nums">
                        {formatCurrency(s.total)}
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">{pct}%</span>
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.fill }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentTransactions() {
  const { transactions } = useFinance();
  const recent = [...transactions].sort(sortByDateDesc).slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimientos recientes</CardTitle>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link to="/transacciones">
              Ver todos <ArrowRight />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aún no hay movimientos. ¡Agrega el primero!
          </p>
        ) : (
          <ul className="divide-y">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-2 py-3">
                <TransactionIcon transaction={t} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.description}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.category} · {dayLabel(t.date)}
                  </p>
                </div>
                <TransactionAmount transaction={t} className="text-sm" />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { data: session } = authClient.useSession();
  const firstName = session?.user.name.trim().split(/\s+/)[0];

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {firstName ? `Hola, ${firstName}` : "Resumen"}
          </h1>
          <p className="text-sm text-muted-foreground">{capitalize(formatMonth(new Date()))}</p>
        </div>
        <TransactionDialog
          trigger={
            <Button className="hidden md:inline-flex">
              <Plus /> Nuevo movimiento
            </Button>
          }
        />
      </div>

      <BalanceHero />

      <div className="grid gap-4 md:grid-cols-2">
        <SalaryCard />
        <SavedSummaryCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <FlowChart />
        <CategoryChart />
      </div>

      <RecentTransactions />
    </div>
  );
}
