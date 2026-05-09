"use client"

import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"
import { motion } from "framer-motion"
import {
  Car,
  Bike,
  Wrench,
  AlertTriangle,
  ShieldAlert,
  Users,
  BarChart3,
  LogOut,
  Moon,
  Sun,
  Languages,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react"

export default function Home() {
  const [lang, setLang] = useState<"ar" | "en">("ar")
  const [darkMode, setDarkMode] = useState(false)
  const [activePage, setActivePage] = useState("vehicles")

  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState("supervisor")
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [vehicles, setVehicles] = useState<any[]>([])
  const [maintenance, setMaintenance] = useState<any[]>([])
  const [breakdowns, setBreakdowns] = useState<any[]>([])
  const [accidents, setAccidents] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])

  const [editingId, setEditingId] = useState<number | null>(null)
  const [vehicleType, setVehicleType] = useState("car")
  const [plate, setPlate] = useState("")
  const [model, setModel] = useState("")
  const [color, setColor] = useState("")
  const [mileage, setMileage] = useState("")
  const [driverName, setDriverName] = useState("")

  const [search, setSearch] = useState("")
  const [listSearch, setListSearch] = useState("")
  const [maintenanceFilter, setMaintenanceFilter] = useState("all")
  const [driverFilter, setDriverFilter] = useState("all")

  const canEditDelete = role === "admin"

  const t = {
    ar: {
      loginTitle: "تسجيل الدخول",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      login: "دخول",
      logout: "تسجيل خروج",
      admin: "مدير",
      supervisor: "مشرف",
      title: "إدارة المركبات",
      subtitle: "لوحة تحكم احترافية لإدارة وصيانة الأسطول",
      vehicles: "المركبات",
      maintenance: "الصيانة",
      breakdowns: "الأعطال",
      accidents: "الحوادث",
      drivers: "السائقين",
      reports: "التقارير",
      addVehicle: "إضافة مركبة جديدة",
      editVehicle: "تعديل مركبة",
      vehicleCount: "عدد المركبات",
      saveVehicle: "حفظ المركبة",
      saveEdit: "حفظ التعديل",
      cancelEdit: "إلغاء التعديل",
      search: "بحث...",
      details: "التفاصيل",
      edit: "تعديل",
      delete: "حذف",
      car: "سيارة",
      motorcycle: "دراجة نارية",
      plate: "رقم اللوحة",
      vehicle: "المركبة",
      model: "الموديل",
      color: "اللون",
      mileage: "قراءة العداد",
      driver: "السائق",
      noData: "لا توجد بيانات",
      type: "النوع",
      cost: "التكلفة",
      date: "التاريخ",
      value: "القيمة",
      notes: "ملاحظات",
      actions: "إجراءات",
      all: "الكل",
      oilChange: "تغيير زيت",
      consumablePart: "قطع مستهلكة",
      primary: "أساسي",
      additional: "إضافي",
      status: "الحالة",
      totalCars: "عدد السيارات",
      totalMotorcycles: "عدد الدراجات",
      totalMaintenanceCost: "تكلفة الصيانة",
      totalBreakdownCost: "تكلفة الأعطال",
      totalAccidentCost: "تكلفة الحوادث",
      dark: "الوضع الليلي",
      light: "الوضع العادي",
      confirmDeleteVehicle: "هل تريد حذف هذه المركبة؟ سيتم حذف سجلاتها المرتبطة أيضًا.",
      confirmDeleteRecord: "هل تريد حذف هذا السجل؟",
    },
    en: {
      loginTitle: "Login",
      email: "Email",
      password: "Password",
      login: "Login",
      logout: "Logout",
      admin: "Admin",
      supervisor: "Supervisor",
      title: "Vehicle Management",
      subtitle: "Professional fleet maintenance dashboard",
      vehicles: "Vehicles",
      maintenance: "Maintenance",
      breakdowns: "Breakdowns",
      accidents: "Accidents",
      drivers: "Drivers",
      reports: "Reports",
      addVehicle: "Add New Vehicle",
      editVehicle: "Edit Vehicle",
      vehicleCount: "Total Vehicles",
      saveVehicle: "Save Vehicle",
      saveEdit: "Save Changes",
      cancelEdit: "Cancel Edit",
      search: "Search...",
      details: "Details",
      edit: "Edit",
      delete: "Delete",
      car: "Car",
      motorcycle: "Motorcycle",
      plate: "Plate Number",
      vehicle: "Vehicle",
      model: "Model",
      color: "Color",
      mileage: "Odometer",
      driver: "Driver",
      noData: "No data found",
      type: "Type",
      cost: "Cost",
      date: "Date",
      value: "Value",
      notes: "Notes",
      actions: "Actions",
      all: "All",
      oilChange: "Oil Change",
      consumablePart: "Consumable Part",
      primary: "Primary",
      additional: "Additional",
      status: "Status",
      totalCars: "Cars",
      totalMotorcycles: "Motorcycles",
      totalMaintenanceCost: "Maintenance Cost",
      totalBreakdownCost: "Breakdown Cost",
      totalAccidentCost: "Accident Cost",
      dark: "Dark Mode",
      light: "Light Mode",
      confirmDeleteVehicle: "Delete this vehicle? Related records will also be deleted.",
      confirmDeleteRecord: "Delete this record?",
    },
  }[lang]

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession()
      const currentUser = data.session?.user || null
      setUser(currentUser)

      if (currentUser) {
        await fetchUserRole(currentUser.id)
        await fetchVehicles()
      }

      setAuthLoading(false)
    }

    initAuth()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user || null
        setUser(currentUser)

        if (currentUser) {
          await fetchUserRole(currentUser.id)
          await fetchVehicles()
        }

        setAuthLoading(false)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .single()

    setRole(data?.role || "supervisor")
  }

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return alert(error.message)
    setEmail("")
    setPassword("")
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole("supervisor")
  }

  const fetchVehicles = async () => {
    const { data } = await supabase
      .from("cars")
      .select("*")
      .order("id", { ascending: false })

    setVehicles(data || [])
  }

  const fetchMaintenance = async () => {
    const { data } = await supabase
      .from("maintenance_records")
      .select("*, cars(*)")
      .order("service_date", { ascending: false })

    setMaintenance(data || [])
  }

  const fetchBreakdowns = async () => {
    const { data } = await supabase
      .from("breakdown_records")
      .select("*, cars(*)")
      .order("breakdown_date", { ascending: false })

    setBreakdowns(data || [])
  }

  const fetchAccidents = async () => {
    const { data } = await supabase
      .from("accident_records")
      .select("*, cars(*)")
      .order("accident_date", { ascending: false })

    setAccidents(data || [])
  }

  const fetchDrivers = async () => {
    const { data } = await supabase
      .from("car_drivers")
      .select("*, cars(*)")
      .order("id", { ascending: false })

    setDrivers(data || [])
  }

  const fetchReports = async () => {
    await Promise.all([
      fetchMaintenance(),
      fetchBreakdowns(),
      fetchAccidents(),
      fetchDrivers(),
    ])
  }

  const resetForm = () => {
    setEditingId(null)
    setVehicleType("car")
    setPlate("")
    setModel("")
    setColor("")
    setMileage("")
    setDriverName("")
  }

  const saveVehicle = async () => {
    if (!plate || !model || !color || !mileage || !driverName) {
      alert(lang === "ar" ? "اكمل البيانات" : "Complete all fields")
      return
    }

    if (editingId) {
      await supabase
        .from("cars")
        .update({
          vehicle_type: vehicleType,
          plate_number: plate,
          car_model: model,
          color,
          current_km: Number(mileage),
          driver_name: driverName,
        })
        .eq("id", editingId)

      resetForm()
      fetchVehicles()
      return
    }

    const { data } = await supabase
      .from("cars")
      .insert([
        {
          vehicle_type: vehicleType,
          plate_number: plate,
          car_model: model,
          color,
          current_km: Number(mileage),
          driver_name: driverName,
        },
      ])
      .select()

    if (data?.[0]) {
      await supabase.from("car_drivers").insert([
        {
          car_id: data[0].id,
          driver_name: driverName,
          driver_type: "primary",
          active: true,
        },
      ])
    }

    resetForm()
    fetchVehicles()
  }

  const startEditVehicle = (vehicle: any) => {
    if (!canEditDelete) return
    setEditingId(vehicle.id)
    setVehicleType(vehicle.vehicle_type || "car")
    setPlate(vehicle.plate_number || "")
    setModel(vehicle.car_model || "")
    setColor(vehicle.color || "")
    setMileage(String(vehicle.current_km || ""))
    setDriverName(vehicle.driver_name || "")
    setActivePage("vehicles")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const deleteVehicle = async (id: number) => {
    if (!canEditDelete) return
    if (!confirm(t.confirmDeleteVehicle)) return

    await supabase.from("cars").delete().eq("id", id)
    fetchVehicles()
  }

  const deleteRecord = async (table: string, id: number) => {
    if (!canEditDelete) return
    if (!confirm(t.confirmDeleteRecord)) return

    await supabase.from(table).delete().eq("id", id)

    if (table === "maintenance_records") fetchMaintenance()
    if (table === "breakdown_records") fetchBreakdowns()
    if (table === "accident_records") fetchAccidents()
    if (table === "car_drivers") fetchDrivers()
  }

  const openPage = async (page: string) => {
    setActivePage(page)
    setListSearch("")
    setMaintenanceFilter("all")
    setDriverFilter("all")

    if (page === "vehicles") await fetchVehicles()
    if (page === "maintenance" && maintenance.length === 0) await fetchMaintenance()
    if (page === "breakdowns" && breakdowns.length === 0) await fetchBreakdowns()
    if (page === "accidents" && accidents.length === 0) await fetchAccidents()
    if (page === "drivers" && drivers.length === 0) await fetchDrivers()
    if (page === "reports") await fetchReports()
  }

  const filteredVehicles = vehicles.filter((v) => {
    const keyword = search.toLowerCase()
    return (
      v.plate_number?.toLowerCase().includes(keyword) ||
      v.car_model?.toLowerCase().includes(keyword) ||
      v.driver_name?.toLowerCase().includes(keyword)
    )
  })

  const filteredMaintenance = maintenance.filter((r) => {
    const keyword = listSearch.toLowerCase()
    return (
      (r.cars?.plate_number?.toLowerCase().includes(keyword) ||
        r.description?.toLowerCase().includes(keyword)) &&
      (maintenanceFilter === "all" || r.type === maintenanceFilter)
    )
  })

  const filteredBreakdowns = breakdowns.filter((r) => {
    const keyword = listSearch.toLowerCase()
    return (
      r.cars?.plate_number?.toLowerCase().includes(keyword) ||
      r.description?.toLowerCase().includes(keyword)
    )
  })

  const filteredAccidents = accidents.filter((r) => {
    const keyword = listSearch.toLowerCase()
    return (
      r.cars?.plate_number?.toLowerCase().includes(keyword) ||
      r.driver_name?.toLowerCase().includes(keyword) ||
      r.description?.toLowerCase().includes(keyword)
    )
  })

  const filteredDrivers = drivers.filter((r) => {
    const keyword = listSearch.toLowerCase()
    return (
      (r.cars?.plate_number?.toLowerCase().includes(keyword) ||
        r.driver_name?.toLowerCase().includes(keyword)) &&
      (driverFilter === "all" || r.driver_type === driverFilter)
    )
  })

  const totalCars = vehicles.filter((v) => v.vehicle_type !== "motorcycle").length
  const totalMotorcycles = vehicles.filter((v) => v.vehicle_type === "motorcycle").length
  const maintenanceCost = maintenance.reduce((sum, r) => sum + Number(r.cost || 0), 0)
  const breakdownCost = breakdowns.reduce((sum, r) => sum + Number(r.cost || 0), 0)
  const accidentCost = accidents.reduce((sum, r) => sum + Number(r.cost || 0), 0)

  const dir = lang === "ar" ? "rtl" : "ltr"
  const bg = darkMode
    ? "bg-[radial-gradient(circle_at_top,_#0f766e_0,_#020617_38%,_#020617_100%)] text-white"
    : "bg-[radial-gradient(circle_at_top,_#ccfbf1_0,_#f8fafc_35%,_#eef2ff_100%)] text-slate-900"

  const card = darkMode
    ? "bg-slate-950/70 border border-white/10 text-white shadow-2xl shadow-black/40 backdrop-blur-xl"
    : "bg-white/80 border border-white/70 text-slate-900 shadow-xl shadow-slate-200/70 backdrop-blur-xl"

  const input = darkMode
    ? "bg-slate-900/80 border-white/10 text-white placeholder-slate-400"
    : "bg-white/90 border-slate-200 text-slate-900 placeholder-slate-400"

  const tableHead = darkMode ? "bg-white/10" : "bg-slate-100"

  if (authLoading) {
    return (
      <main className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="animate-pulse text-xl font-bold">Loading...</div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className={`min-h-screen flex items-center justify-center p-6 ${bg}`} dir={dir}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={`${card} p-8 rounded-[2rem] w-full max-w-md`}
        >
          <div className="w-16 h-16 mx-auto mb-5 rounded-3xl bg-teal-500 flex items-center justify-center text-black">
            <Car size={34} />
          </div>

          <h1 className="text-3xl font-black mb-2 text-center">{t.loginTitle}</h1>
          <p className="text-center text-sm text-slate-500 mb-6">Mandobly Garage</p>

          <div className="grid gap-4">
            <input placeholder={t.email} value={email} onChange={(e) => setEmail(e.target.value)} className={`border p-4 rounded-2xl outline-none ${input}`} />
            <input type="password" placeholder={t.password} value={password} onChange={(e) => setPassword(e.target.value)} className={`border p-4 rounded-2xl outline-none ${input}`} />

            <button onClick={login} className="bg-slate-950 text-white p-4 rounded-2xl font-bold hover:scale-[1.01] transition">
              {t.login}
            </button>

            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="bg-teal-500 text-black p-4 rounded-2xl font-bold hover:scale-[1.01] transition">
              {lang === "ar" ? "English" : "العربية"}
            </button>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className={`min-h-screen flex ${bg}`} dir={dir}>
      <aside className="w-72 bg-slate-950 text-white p-5 hidden md:flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center text-black">
            <Car />
          </div>
          <div>
            <h1 className="text-2xl font-black">Mandobly</h1>
            <p className="text-xs text-slate-400">Garage System</p>
          </div>
        </div>

        <div className="mb-6 bg-white/10 p-4 rounded-3xl border border-white/10">
          <p className="text-xs text-slate-400 mb-1">{t.status}</p>
          <p className="font-bold">{role === "admin" ? t.admin : t.supervisor}</p>
        </div>

        <div className="space-y-2 flex-1">
          <SideButton active={activePage === "vehicles"} onClick={() => openPage("vehicles")} icon={<Car size={20} />}>{t.vehicles}</SideButton>
          <SideButton active={activePage === "maintenance"} onClick={() => openPage("maintenance")} icon={<Wrench size={20} />}>{t.maintenance}</SideButton>
          <SideButton active={activePage === "breakdowns"} onClick={() => openPage("breakdowns")} icon={<AlertTriangle size={20} />}>{t.breakdowns}</SideButton>
          <SideButton active={activePage === "accidents"} onClick={() => openPage("accidents")} icon={<ShieldAlert size={20} />}>{t.accidents}</SideButton>
          <SideButton active={activePage === "drivers"} onClick={() => openPage("drivers")} icon={<Users size={20} />}>{t.drivers}</SideButton>
          <SideButton active={activePage === "reports"} onClick={() => openPage("reports")} icon={<BarChart3 size={20} />}>{t.reports}</SideButton>
        </div>

        <button onClick={logout} className="mt-6 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white p-3 rounded-2xl font-bold transition">
          <LogOut size={18} />
          {t.logout}
        </button>
      </aside>

      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
        <div className={`${card} rounded-[2rem] p-5 md:p-6 mb-6`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <h2 className="text-3xl lg:text-5xl font-black">{t.title}</h2>
              <p className={darkMode ? "text-slate-400 mt-2" : "text-slate-500 mt-2"}>{t.subtitle}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setDarkMode(!darkMode)} className="bg-teal-500 text-black px-5 py-3 rounded-2xl font-bold flex items-center gap-2">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                {darkMode ? t.light : t.dark}
              </button>

              <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="bg-slate-950 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2">
                <Languages size={18} />
                {lang === "ar" ? "English" : "العربية"}
              </button>

              <button onClick={logout} className="bg-red-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 md:hidden">
                <LogOut size={18} />
                {t.logout}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <Stat icon={<Car />} title={t.vehicleCount} value={vehicles.length} card={card} />
          <Stat icon={<Wrench />} title={t.maintenance} value={maintenance.length} card={card} />
          <Stat icon={<AlertTriangle />} title={t.breakdowns} value={breakdowns.length} card={card} />
          <Stat icon={<ShieldAlert />} title={t.accidents} value={accidents.length} card={card} />
        </div>

        {activePage === "vehicles" && (
          <>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`${card} p-5 md:p-6 rounded-[2rem] mb-8`}>
              <h3 className="text-2xl font-black mb-5 flex items-center gap-2">
                <Plus />
                {editingId ? t.editVehicle : t.addVehicle}
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className={`border p-3 rounded-2xl outline-none ${input}`}>
                  <option value="car">{t.car}</option>
                  <option value="motorcycle">{t.motorcycle}</option>
                </select>

                <input placeholder={t.plate} value={plate} onChange={(e) => setPlate(e.target.value)} className={`border p-3 rounded-2xl outline-none ${input}`} />
                <input placeholder={t.model} value={model} onChange={(e) => setModel(e.target.value)} className={`border p-3 rounded-2xl outline-none ${input}`} />
                <input placeholder={t.color} value={color} onChange={(e) => setColor(e.target.value)} className={`border p-3 rounded-2xl outline-none ${input}`} />
                <input type="number" placeholder={t.mileage} value={mileage} onChange={(e) => setMileage(e.target.value)} className={`border p-3 rounded-2xl outline-none ${input}`} />
                <input placeholder={t.driver} value={driverName} onChange={(e) => setDriverName(e.target.value)} className={`border p-3 rounded-2xl outline-none ${input}`} />
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={saveVehicle} className="bg-teal-500 text-black px-6 py-3 rounded-2xl font-black">
                  {editingId ? t.saveEdit : t.saveVehicle}
                </button>

                {editingId && (
                  <button onClick={resetForm} className="bg-slate-600 text-white px-6 py-3 rounded-2xl font-bold">
                    {t.cancelEdit}
                  </button>
                )}
              </div>
            </motion.div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h3 className="text-2xl font-black">{t.vehicles}</h3>
              <div className="relative w-full md:w-96">
                <Search className="absolute top-3.5 right-4 text-slate-400" size={20} />
                <input placeholder={t.search} value={search} onChange={(e) => setSearch(e.target.value)} className={`border p-3 rounded-2xl w-full outline-none ${input}`} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`${card} rounded-[2rem] p-6 hover:scale-[1.01] transition`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h4 className="text-3xl font-black">{vehicle.plate_number}</h4>
                      <p className="text-slate-500">{vehicle.car_model}</p>
                    </div>

                    <div className="w-16 h-16 rounded-3xl bg-teal-500/20 text-teal-500 flex items-center justify-center">
                      {vehicle.vehicle_type === "motorcycle" ? <Bike size={34} /> : <Car size={34} />}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <InfoLine label={t.type} value={vehicle.vehicle_type === "motorcycle" ? t.motorcycle : t.car} />
                    <InfoLine label={t.color} value={vehicle.color || "-"} />
                    <InfoLine label={t.driver} value={vehicle.driver_name || "-"} />
                    <InfoLine label={t.mileage} value={`${vehicle.current_km || 0} KM`} />
                  </div>

                  <div className={`grid gap-3 mt-6 ${canEditDelete ? "grid-cols-3" : "grid-cols-1"}`}>
                    <a href={`/cars/${vehicle.id}`} className="bg-slate-950 text-white p-3 rounded-2xl text-center flex items-center justify-center gap-2">
                      <Eye size={16} />
                      {t.details}
                    </a>

                    {canEditDelete && (
                      <>
                        <button onClick={() => startEditVehicle(vehicle)} className="bg-teal-500 text-black p-3 rounded-2xl font-bold flex items-center justify-center gap-2">
                          <Pencil size={16} />
                          {t.edit}
                        </button>

                        <button onClick={() => deleteVehicle(vehicle.id)} className="bg-red-600 text-white p-3 rounded-2xl font-bold flex items-center justify-center gap-2">
                          <Trash2 size={16} />
                          {t.delete}
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {activePage === "maintenance" && (
          <ListSection title={t.maintenance} search={listSearch} setSearch={setListSearch} searchLabel={t.search} card={card} input={input}>
            <select value={maintenanceFilter} onChange={(e) => setMaintenanceFilter(e.target.value)} className={`border p-3 rounded-2xl ${input}`}>
              <option value="all">{t.all}</option>
              <option value="oil_change">{t.oilChange}</option>
              <option value="consumable_part">{t.consumablePart}</option>
            </select>

            <ListTable t={t} empty={t.noData} tableHead={tableHead}>
              {filteredMaintenance.map((r, index) => (
                <tr key={r.id} className="border-b border-slate-700/30 hover:bg-teal-500/10">
                  <td className="p-4">{index + 1}</td>
                  <td className="p-4">{r.cars?.plate_number || "-"}</td>
                  <td className="p-4">{r.type === "oil_change" ? t.oilChange : t.consumablePart}</td>
                  <td className="p-4">{r.service_date}</td>
                  <td className="p-4">{r.odometer_km || "-"}</td>
                  <td className="p-4">{r.description || "-"}</td>
                  <td className="p-4">
                    {canEditDelete ? (
                      <button onClick={() => deleteRecord("maintenance_records", r.id)} className="bg-red-600 text-white px-3 py-2 rounded-xl">
                        {t.delete}
                      </button>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </ListTable>
          </ListSection>
        )}

        {activePage === "breakdowns" && (
          <ListSection title={t.breakdowns} search={listSearch} setSearch={setListSearch} searchLabel={t.search} card={card} input={input}>
            <ListTable t={t} empty={t.noData} tableHead={tableHead}>
              {filteredBreakdowns.map((r, index) => (
                <tr key={r.id} className="border-b border-slate-700/30 hover:bg-teal-500/10">
                  <td className="p-4">{index + 1}</td>
                  <td className="p-4">{r.cars?.plate_number || "-"}</td>
                  <td className="p-4">{r.breakdown_date}</td>
                  <td className="p-4">{r.description}</td>
                  <td className="p-4">{r.cost} SAR</td>
                  <td className="p-4">-</td>
                  <td className="p-4">
                    {canEditDelete ? (
                      <button onClick={() => deleteRecord("breakdown_records", r.id)} className="bg-red-600 text-white px-3 py-2 rounded-xl">
                        {t.delete}
                      </button>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </ListTable>
          </ListSection>
        )}

        {activePage === "accidents" && (
          <ListSection title={t.accidents} search={listSearch} setSearch={setListSearch} searchLabel={t.search} card={card} input={input}>
            <ListTable t={t} empty={t.noData} tableHead={tableHead}>
              {filteredAccidents.map((r, index) => (
                <tr key={r.id} className="border-b border-slate-700/30 hover:bg-teal-500/10">
                  <td className="p-4">{index + 1}</td>
                  <td className="p-4">{r.cars?.plate_number || "-"}</td>
                  <td className="p-4">{r.driver_name || "-"}</td>
                  <td className="p-4">{r.accident_date}</td>
                  <td className="p-4">{r.driver_fault_percent}%</td>
                  <td className="p-4">{r.cost} SAR</td>
                  <td className="p-4">
                    {canEditDelete ? (
                      <button onClick={() => deleteRecord("accident_records", r.id)} className="bg-red-600 text-white px-3 py-2 rounded-xl">
                        {t.delete}
                      </button>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </ListTable>
          </ListSection>
        )}

        {activePage === "drivers" && (
          <ListSection title={t.drivers} search={listSearch} setSearch={setListSearch} searchLabel={t.search} card={card} input={input}>
            <select value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)} className={`border p-3 rounded-2xl ${input}`}>
              <option value="all">{t.all}</option>
              <option value="primary">{t.primary}</option>
              <option value="additional">{t.additional}</option>
            </select>

            <ListTable t={t} empty={t.noData} tableHead={tableHead}>
              {filteredDrivers.map((r, index) => (
                <tr key={r.id} className="border-b border-slate-700/30 hover:bg-teal-500/10">
                  <td className="p-4">{index + 1}</td>
                  <td className="p-4">{r.cars?.plate_number || "-"}</td>
                  <td className="p-4">{r.driver_name}</td>
                  <td className="p-4">{r.driver_type === "primary" ? t.primary : t.additional}</td>
                  <td className="p-4">{r.shift_time || "-"}</td>
                  <td className="p-4">{r.active ? "Active" : "Inactive"}</td>
                  <td className="p-4">
                    {canEditDelete ? (
                      <button onClick={() => deleteRecord("car_drivers", r.id)} className="bg-red-600 text-white px-3 py-2 rounded-xl">
                        {t.delete}
                      </button>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </ListTable>
          </ListSection>
        )}

        {activePage === "reports" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <ReportCard title={t.vehicleCount} value={vehicles.length} card={card} icon={<Car />} />
            <ReportCard title={t.totalCars} value={totalCars} card={card} icon={<Car />} />
            <ReportCard title={t.totalMotorcycles} value={totalMotorcycles} card={card} icon={<Bike />} />
            <ReportCard title={t.maintenance} value={maintenance.length} card={card} icon={<Wrench />} />
            <ReportCard title={t.breakdowns} value={breakdowns.length} card={card} icon={<AlertTriangle />} />
            <ReportCard title={t.accidents} value={accidents.length} card={card} icon={<ShieldAlert />} />
            <ReportCard title={t.totalMaintenanceCost} value={`${maintenanceCost} SAR`} card={card} icon={<BarChart3 />} />
            <ReportCard title={t.totalBreakdownCost} value={`${breakdownCost} SAR`} card={card} icon={<BarChart3 />} />
            <ReportCard title={t.totalAccidentCost} value={`${accidentCost} SAR`} card={card} icon={<BarChart3 />} />
          </div>
        )}
      </div>
    </main>
  )
}

function SideButton({ active, onClick, children, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition ${
        active
          ? "bg-teal-500 text-black font-black shadow-lg shadow-teal-500/30"
          : "hover:bg-white/10 text-slate-300"
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}

function Stat({ title, value, card, icon }: any) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`${card} p-5 md:p-6 rounded-[2rem]`}
    >
      <div className="flex items-center justify-between">
        <p className="text-slate-500">{title}</p>
        <div className="w-11 h-11 rounded-2xl bg-teal-500/20 text-teal-500 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="text-4xl font-black mt-4">{value}</h3>
    </motion.div>
  )
}

function ReportCard({ title, value, card, icon }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`${card} p-6 rounded-[2rem]`}
    >
      <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-500 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-slate-500">{title}</p>
      <h3 className="text-4xl font-black mt-3">{value}</h3>
    </motion.div>
  )
}

function InfoLine({ label, value }: any) {
  return (
    <div className="rounded-2xl bg-slate-500/10 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-black mt-1">{value}</p>
    </div>
  )
}

function ListSection({ title, search, setSearch, searchLabel, children, card, input }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`${card} p-6 rounded-[2rem]`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h3 className="text-2xl font-black">{title}</h3>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            placeholder={searchLabel}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`border p-3 rounded-2xl outline-none ${input}`}
          />

          {children?.[0]?.type === "select" ? children[0] : null}
        </div>
      </div>

      {children?.[0]?.type === "select" ? children[1] : children}
    </motion.div>
  )
}

function ListTable({ children, empty, t, tableHead }: any) {
  const hasData = Array.isArray(children) && children.length > 0

  return (
    <div className="overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[950px] text-sm">
        <thead>
          <tr className={`${tableHead} border-b border-slate-700/30`}>
            <th className="p-4 text-right">#</th>
            <th className="p-4 text-right">{t.vehicle}</th>
            <th className="p-4 text-right">{t.type}</th>
            <th className="p-4 text-right">{t.date}</th>
            <th className="p-4 text-right">{t.value}</th>
            <th className="p-4 text-right">{t.notes}</th>
            <th className="p-4 text-right">{t.actions}</th>
          </tr>
        </thead>

        <tbody>
          {hasData ? (
            children
          ) : (
            <tr>
              <td colSpan={7} className="text-center p-8 text-slate-500">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}