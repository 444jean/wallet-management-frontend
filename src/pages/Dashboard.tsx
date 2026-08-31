import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownLeft, ArrowUpRight, Plus, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { SalaryCard } from "@/components/salary/SalaryCard";
import { SavedSummaryCard } from "@/components/savings/SavedSummaryCard";
import { useFinance } from "@/hooks/use-finance";
import { useStats, sortByDateDesc } from "@/hooks/use-stats";
import { formatCurrency, formatDate } from "@/lib/utils";

const CATEGORY_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#64748b",
];

function StatCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent?: "income" | "expense" | "neutral";
}) {
  const color =
    accent === "income"
      ? "text-primary"
      : accent === "expense"
        ? "text-destructive"
        : "text-foreground";
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { transactions } = useFinance();
  const stats = useStats();
  const recent = [...transactions].sort(sortByDateDesc).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resumen</h1>
          <p className="text-sm text-muted-foreground">Tu situación financiera de un vistazo.</p>
        </div>
        <TransactionDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4" /> Nuevo movimiento
            </Button>
          }
        />
      </div>

      <SalaryCard />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Balance total"
          value={formatCurrency(stats.balance)}
          accent={stats.balance >= 0 ? "income" : "expense"}
          icon={<Wallet className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Ingresos del mes"
          value={formatCurrency(stats.monthIncome)}
          accent="income"
          icon={<ArrowUpRight className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Gastos del mes"
          value={formatCurrency(stats.monthExpense)}
          accent="expense"
          icon={<ArrowDownLeft className="h-5 w-5 text-destructive" />}
        />
        <StatCard
          title="Ahorro del mes"
          value={formatCurrency(stats.monthBalance)}
          accent={stats.monthBalance >= 0 ? "income" : "expense"}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
      </div>

      <SavedSummaryCard />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Ingresos vs Gastos</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.months} barGap={6}>
                <XAxis
                  dataKey="label"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  width={40}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number, name) => [
                    formatCurrency(value),
                    name === "income" ? "Ingresos" : "Gastos",
                  ]}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gastos por categoría</CardTitle>
            <CardDescription>Mes actual</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.categorySlices.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Sin gastos este mes.
              </p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.categorySlices}
                      dataKey="total"
                      nameKey="category"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {stats.categorySlices.map((_, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-1.5">
                  {stats.categorySlices.slice(0, 4).map((slice, i) => (
                    <div key={slice.category} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                        />
                        {slice.category}
                      </span>
                      <span className="font-medium">{formatCurrency(slice.total)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos recientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aún no hay movimientos. ¡Agrega el primero!
            </p>
          ) : (
            recent.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      t.type === "income" ? "bg-primary/15" : "bg-destructive/15"
                    }`}
                  >
                    {t.type === "income" ? (
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{t.category}</Badge>
                  <span
                    className={`text-sm font-semibold ${
                      t.type === "income" ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {t.type === "income" ? "+" : "−"}
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
