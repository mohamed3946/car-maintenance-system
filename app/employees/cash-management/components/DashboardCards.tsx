import { Banknote, Users, Wallet } from "lucide-react";

type Props = {
  totalCash: number;
  totalDeposit: number;
  companyBalance: number;
  ridersCount: number;
  text: {
    totalCash: string;
    totalDeposit: string;
    companyBalance: string;
    ridersCount: string;
  };
};

export default function DashboardCards({
  totalCash,
  totalDeposit,
  companyBalance,
  ridersCount,
  text,
}: Props) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title={text.totalCash}
        value={`SAR ${totalCash.toLocaleString()}`}
        icon={<Banknote className="h-7 w-7" />}
        color="green"
      />

      <StatCard
        title={text.totalDeposit}
        value={`SAR ${totalDeposit.toLocaleString()}`}
        icon={<Wallet className="h-7 w-7" />}
        color="blue"
      />

      <StatCard
        title={text.companyBalance}
        value={`SAR ${companyBalance.toLocaleString()}`}
        icon={<Wallet className="h-7 w-7" />}
        color="orange"
      />

      <StatCard
        title={text.ridersCount}
        value={ridersCount}
        icon={<Users className="h-7 w-7" />}
        color="red"
      />
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors[color]}`}
        >
          {icon}
        </div>

        <div className="text-right">
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-extrabold text-[#0f2544]">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}