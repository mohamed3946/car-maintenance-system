"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <path d="M17 9V7A5 5 0 0 0 7 7v2H5v12h14V9h-2Zm-8 0V7a3 3 0 0 1 6 0v2H9Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <path d="M12 5c5.5 0 9.5 5 10.8 7-1.3 2-5.3 7-10.8 7S2.5 14 1.2 12C2.5 10 6.5 5 12 5Zm0 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none" aria-hidden="true">
      <path d="M32 7 52 15v15c0 14-8 24-20 29C20 54 12 44 12 30V15l20-8Z" fill="url(#shieldA)" stroke="white" strokeWidth="4" />
      <path d="M23 32l6 6 13-15" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="shieldA" x1="12" y1="7" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SpeedIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none" aria-hidden="true">
      <path d="M12 43a22 22 0 1 1 40 0" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <path d="M32 43l14-18" stroke="#BFDBFE" strokeWidth="5" strokeLinecap="round" />
      <circle cx="32" cy="43" r="5" fill="#60A5FA" />
      <path d="M18 43h-5M51 43h-5M21 25l-4-4M43 25l4-4M32 18v-6" stroke="white" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none" aria-hidden="true">
      <rect x="12" y="37" width="9" height="15" rx="2" fill="#8B5CF6" />
      <rect x="27" y="29" width="9" height="23" rx="2" fill="#38BDF8" />
      <rect x="42" y="18" width="9" height="34" rx="2" fill="#22C55E" />
      <path d="M12 21c10 2 20-1 29-11" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <path d="M41 10h10v10" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WorldMapDots() {
  const dots = [
    [120, 90], [140, 80], [160, 75], [180, 88], [200, 96], [220, 110], [190, 125], [155, 120],
    [250, 145], [275, 160], [300, 180], [315, 210], [295, 238], [270, 260], [245, 230], [235, 190],
    [420, 75], [450, 65], [485, 70], [520, 85], [540, 110], [520, 135], [480, 135], [445, 120],
    [545, 150], [585, 138], [625, 145], [660, 165], [700, 160], [735, 178], [770, 210], [740, 235], [690, 225], [645, 205], [605, 188],
    [575, 240], [610, 260], [630, 300], [600, 330], [550, 315], [530, 275],
    [740, 285], [785, 295], [825, 320], [850, 360], [820, 390], [760, 370], [725, 330],
    [850, 105], [880, 95], [910, 110], [925, 140], [900, 160], [865, 150],
  ];

  return (
    <svg viewBox="0 0 1000 430" className="absolute left-1/2 top-7 h-[330px] w-[790px] -translate-x-1/2 opacity-40" aria-hidden="true">
      <g fill="#7DD3FC">
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" />
        ))}
      </g>
      <g stroke="#38BDF8" strokeWidth="2.2" opacity="0.75" fill="none">
        <path d="M110 170C260 70 430 70 575 145c92 48 175 44 330-12" />
        <path d="M260 285c115-70 250-78 395-15 80 35 150 39 245-3" />
      </g>
      <g fill="#7DD3FC" opacity="0.5">
        {Array.from({ length: 170 }).map((_, i) => {
          const x = 95 + (i % 34) * 23;
          const y = 55 + Math.floor(i / 34) * 18;
          if ((x > 340 && x < 380) || (x > 790 && y < 130)) return null;
          return <circle key={`small-${i}`} cx={x} cy={y} r="1.8" />;
        })}
      </g>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert("من فضلك أدخل اسم المستخدم وكلمة المرور");
      return;
    }

    if (remember) localStorage.setItem("user", username);
    router.push("/systems");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef5fc] px-6 py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,#ffffff_0,transparent_32%),radial-gradient(circle_at_92%_86%,#d7e9fb_0,transparent_36%)]" />

      <section
        dir="ltr"
        className="relative z-10 mx-auto grid h-[calc(100vh-48px)] min-h-[820px] w-full max-w-[1720px] overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-blue-200/60 lg:grid-cols-[45%_55%]"
      >
        <div dir="rtl" className="flex h-full items-center justify-center bg-white px-16 py-8">
          <div className="w-full max-w-[600px]">
            <div className="mb-9 text-center">
              <Image
                src="/logo.png"
                alt="شعار نمو التوصيل"
                width={295}
                height={205}
                priority
                className="mx-auto h-auto w-[295px] object-contain"
              />

              <h1 className="mt-9 text-[44px] font-black leading-none text-[#062b5f]">مرحبًا بك</h1>
              <p className="mt-5 text-[19px] text-slate-600">تسجيل الدخول لنظام إدارة المؤسسة</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="mb-3 block text-[16px] font-black text-[#062b5f]">اسم المستخدم</label>
                <div className="relative">
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400"><UserIcon /></span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم"
                    className="h-[66px] w-full rounded-2xl border border-[#c7d4e4] bg-white pr-16 pl-5 text-[17px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#073a78] focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-3 block text-[16px] font-black text-[#062b5f]">كلمة المرور</label>
                <div className="relative">
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400"><LockIcon /></span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="h-[66px] w-full rounded-2xl border border-[#c7d4e4] bg-white pr-16 pl-16 text-[17px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#073a78] focus:ring-4 focus:ring-blue-100"
                  />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><EyeIcon /></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[16px]">
                <label className="flex cursor-pointer items-center gap-2 font-bold text-[#062b5f]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-5 w-5 accent-[#073a78]"
                  />
                  تذكرني
                </label>

                <button type="button" className="font-bold text-[#073a78] hover:underline">نسيت كلمة المرور؟</button>
              </div>

              <button
                type="submit"
                className="mt-6 h-[70px] w-full rounded-2xl bg-gradient-to-l from-[#002f6c] to-[#074b9b] text-[24px] font-black text-white shadow-xl shadow-blue-300/55 transition hover:from-[#00285a] hover:to-[#063f83] active:scale-[0.99]"
              >
                تسجيل الدخول
              </button>
            </form>

            <p className="mt-11 text-center text-[15px] text-slate-400">جميع الحقوق محفوظة © نمو التوصيل للخدمات اللوجستية</p>
          </div>
        </div>

        <div dir="rtl" className="relative hidden h-full overflow-hidden lg:block">
          <Image src="/login-banner.png" alt="منصة نمو التوصيل" fill priority className="object-cover object-center" />

          <div className="absolute inset-0 bg-[#052f70]/34" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#00245c]/70 via-[#073c83]/16 to-[#002a62]/48" />
          <WorldMapDots />

          <div className="absolute right-8 top-6 h-[150px] w-[235px] opacity-65 bg-[radial-gradient(circle,#ffffff_2px,transparent_2.8px)] [background-size:18px_18px]" />
          <div className="absolute left-10 bottom-8 h-[125px] w-[230px] opacity-60 bg-[radial-gradient(circle,#ffffff_2px,transparent_2.8px)] [background-size:18px_18px]" />

          <div className="relative z-10 flex h-full flex-col items-center justify-start px-16 pt-[235px] text-center text-white">
            <h2 className="text-[58px] font-black leading-[1.2] drop-shadow-sm">نظام إدارة المؤسسة</h2>
            <p className="mx-auto mt-7 max-w-[820px] text-[26px] leading-[1.65] text-white/95">
              منصة متكاملة لإدارة جميع العمليات والموظفين والأنظمة بكفاءة واحترافية
            </p>

            <div className="mt-12 grid w-full max-w-[670px] grid-cols-3 gap-9">
              <div className="flex flex-col items-center">
                <div className="flex h-[112px] w-[112px] items-center justify-center rounded-[22px] border border-white/25 bg-white/10 shadow-2xl shadow-blue-950/20 backdrop-blur-md"><ShieldIcon /></div>
                <p className="mt-4 text-[22px] font-black">آمن وموثوق</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-[112px] w-[112px] items-center justify-center rounded-[22px] border border-white/25 bg-white/10 shadow-2xl shadow-blue-950/20 backdrop-blur-md"><SpeedIcon /></div>
                <p className="mt-4 text-[22px] font-black">سريع وفعال</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-[112px] w-[112px] items-center justify-center rounded-[22px] border border-white/25 bg-white/10 shadow-2xl shadow-blue-950/20 backdrop-blur-md"><ChartIcon /></div>
                <p className="mt-4 text-[22px] font-black">تقارير ذكية</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

