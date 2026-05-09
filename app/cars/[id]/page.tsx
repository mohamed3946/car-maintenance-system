"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "../../lib/supabase"

export default function VehicleDetails() {
  const params = useParams()
  const id = params.id as string

  const [lang, setLang] = useState<"ar" | "en">("ar")
  const [role, setRole] = useState("supervisor")
  const [vehicle, setVehicle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("maintenance")
  const [previewImage, setPreviewImage] = useState("")

  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([])
  const [maintenanceType, setMaintenanceType] = useState("oil_change")
  const [maintenanceDate, setMaintenanceDate] = useState("")
  const [maintenanceKm, setMaintenanceKm] = useState("")
  const [maintenanceDesc, setMaintenanceDesc] = useState("")
  const [maintenanceCost, setMaintenanceCost] = useState("")
  const [oilFilterChanged, setOilFilterChanged] = useState("no")
  const [maintenanceFilter, setMaintenanceFilter] = useState("all")

  const [breakdownRecords, setBreakdownRecords] = useState<any[]>([])
  const [breakdownDate, setBreakdownDate] = useState("")
  const [breakdownDesc, setBreakdownDesc] = useState("")
  const [breakdownCost, setBreakdownCost] = useState("")

  const [accidentRecords, setAccidentRecords] = useState<any[]>([])
  const [accidentDate, setAccidentDate] = useState("")
  const [accidentDriver, setAccidentDriver] = useState("")
  const [accidentDesc, setAccidentDesc] = useState("")
  const [faultPercent, setFaultPercent] = useState("")
  const [accidentCost, setAccidentCost] = useState("")
  const [accidentFile, setAccidentFile] = useState<File | null>(null)

  const [drivers, setDrivers] = useState<any[]>([])
  const [driverAction, setDriverAction] = useState("change")
  const [newDriverName, setNewDriverName] = useState("")
  const [driverStartDate, setDriverStartDate] = useState("")
  const [shiftTime, setShiftTime] = useState("")

  const canEditDelete = role === "admin"

  const t = {
    ar: {
      back: "رجوع",
      details: "تفاصيل المركبة",
      type: "النوع",
      car: "سيارة",
      motorcycle: "دراجة نارية",
      plate: "رقم اللوحة",
      model: "الموديل",
      color: "اللون",
      driver: "السائق",
      odometer: "العداد",
      maintenance: "الصيانة",
      breakdowns: "الأعطال",
      accidents: "الحوادث",
      drivers: "السائقين",
      oilChange: "تغيير زيت",
      consumablePart: "قطع مستهلكة",
      date: "التاريخ",
      filterChanged: "تم تغيير الفلتر",
      filterNotChanged: "لم يتم تغيير الفلتر",
      partName: "اسم القطعة / الوصف",
      cost: "التكلفة",
      save: "حفظ",
      all: "الكل",
      delete: "حذف",
      breakdownDesc: "وصف العطل",
      accidentDesc: "وصف الحادث",
      selectDriver: "اختر السائق",
      faultPercent: "نسبة الخطأ",
      accidentImage: "رفع / التقاط صورة الحادث",
      changeMainDriver: "تغيير السائق الأساسي",
      addExtraDriver: "إضافة سائق إضافي",
      driverName: "اسم السائق",
      startDate: "تاريخ البداية",
      shiftOptional: "موعد الوردية اختياري",
      primary: "أساسي",
      additional: "إضافي",
      active: "نشط",
      inactive: "غير نشط",
      role: "الصلاحية",
      admin: "مدير",
      supervisor: "مشرف",
      loading: "جاري التحميل...",
      notFound: "المركبة غير موجودة",
      confirmDelete: "هل تريد حذف هذا السجل؟",
      imagePreview: "معاينة الصورة",
    },
    en: {
      back: "Back",
      details: "Vehicle Details",
      type: "Type",
      car: "Car",
      motorcycle: "Motorcycle",
      plate: "Plate Number",
      model: "Model",
      color: "Color",
      driver: "Driver",
      odometer: "Odometer",
      maintenance: "Maintenance",
      breakdowns: "Breakdowns",
      accidents: "Accidents",
      drivers: "Drivers",
      oilChange: "Oil Change",
      consumablePart: "Consumable Part",
      date: "Date",
      filterChanged: "Filter Changed",
      filterNotChanged: "Filter Not Changed",
      partName: "Part name / description",
      cost: "Cost",
      save: "Save",
      all: "All",
      delete: "Delete",
      breakdownDesc: "Breakdown description",
      accidentDesc: "Accident description",
      selectDriver: "Select Driver",
      faultPercent: "Fault Percent",
      accidentImage: "Upload / Take accident photo",
      changeMainDriver: "Change Main Driver",
      addExtraDriver: "Add Extra Driver",
      driverName: "Driver Name",
      startDate: "Start Date",
      shiftOptional: "Shift time optional",
      primary: "Primary",
      additional: "Additional",
      active: "Active",
      inactive: "Inactive",
      role: "Role",
      admin: "Admin",
      supervisor: "Supervisor",
      loading: "Loading...",
      notFound: "Vehicle not found",
      confirmDelete: "Delete this record?",
      imagePreview: "Image Preview",
    },
  }[lang]

  const fetchRole = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user?.id
    if (!userId) return

    const { data } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .single()

    setRole(data?.role || "supervisor")
  }

  const fetchVehicle = async () => {
    const { data } = await supabase
      .from("cars")
      .select("*")
      .eq("id", id)
      .single()

    setVehicle(data)
    setLoading(false)
  }

  const fetchMaintenance = async () => {
    const { data } = await supabase
      .from("maintenance_records")
      .select("*")
      .eq("car_id", id)
      .order("service_date", { ascending: false })

    setMaintenanceRecords(data || [])
  }

  const fetchBreakdowns = async () => {
    const { data } = await supabase
      .from("breakdown_records")
      .select("*")
      .eq("car_id", id)
      .order("breakdown_date", { ascending: false })

    setBreakdownRecords(data || [])
  }

  const fetchAccidents = async () => {
    const { data } = await supabase
      .from("accident_records")
      .select("*")
      .eq("car_id", id)
      .order("accident_date", { ascending: false })

    setAccidentRecords(data || [])
  }

  const fetchDrivers = async () => {
    const { data } = await supabase
      .from("car_drivers")
      .select("*")
      .eq("car_id", id)
      .order("id", { ascending: false })

    setDrivers(data || [])
  }

  useEffect(() => {
    if (id) {
      fetchRole()
      fetchVehicle()
      fetchMaintenance()
      fetchBreakdowns()
      fetchAccidents()
      fetchDrivers()
    }
  }, [id])

  const deleteRecord = async (table: string, recordId: number) => {
    if (!canEditDelete) return
    if (!confirm(t.confirmDelete)) return

    await supabase.from(table).delete().eq("id", recordId)

    fetchMaintenance()
    fetchBreakdowns()
    fetchAccidents()
    fetchDrivers()
  }

  const addMaintenance = async () => {
    if (!maintenanceDate) return
    if (maintenanceType === "oil_change" && !maintenanceKm) return

    await supabase.from("maintenance_records").insert([
      {
        car_id: id,
        type: maintenanceType,
        service_date: maintenanceDate,
        odometer_km:
          maintenanceType === "oil_change" ? Number(maintenanceKm) : null,
        description:
          maintenanceType === "consumable_part" ? maintenanceDesc : "",
        cost:
          maintenanceType === "consumable_part"
            ? Number(maintenanceCost || 0)
            : 0,
        oil_filter_changed:
          maintenanceType === "oil_change" && oilFilterChanged === "yes",
      },
    ])

    if (maintenanceType === "oil_change") {
      await supabase
        .from("cars")
        .update({ current_km: Number(maintenanceKm) })
        .eq("id", id)

      fetchVehicle()
    }

    setMaintenanceDate("")
    setMaintenanceKm("")
    setMaintenanceDesc("")
    setMaintenanceCost("")
    setOilFilterChanged("no")
    fetchMaintenance()
  }

  const addBreakdown = async () => {
    if (!breakdownDate || !breakdownDesc) return

    await supabase.from("breakdown_records").insert([
      {
        car_id: id,
        breakdown_date: breakdownDate,
        description: breakdownDesc,
        cost: Number(breakdownCost || 0),
      },
    ])

    setBreakdownDate("")
    setBreakdownDesc("")
    setBreakdownCost("")
    fetchBreakdowns()
  }

  const uploadAccidentImage = async () => {
    if (!accidentFile) return ""

    const fileExt = accidentFile.name.split(".").pop()
    const fileName = `${id}-${Date.now()}.${fileExt}`
    const filePath = `accidents/${fileName}`

    const { error } = await supabase.storage
      .from("accidents")
      .upload(filePath, accidentFile)

    if (error) {
      console.log(error)
      alert("Image upload failed")
      return ""
    }

    const { data } = supabase.storage
      .from("accidents")
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const addAccident = async () => {
    if (!accidentDate || !accidentDriver) return

    const imageUrl = await uploadAccidentImage()

    await supabase.from("accident_records").insert([
      {
        car_id: id,
        accident_date: accidentDate,
        driver_name: accidentDriver,
        description: accidentDesc,
        driver_fault_percent: Number(faultPercent || 0),
        cost: Number(accidentCost || 0),
        image_url: imageUrl,
      },
    ])

    setAccidentDate("")
    setAccidentDriver("")
    setAccidentDesc("")
    setFaultPercent("")
    setAccidentCost("")
    setAccidentFile(null)
    fetchAccidents()
  }

  const saveDriver = async () => {
    if (!newDriverName) return

    const startDate = driverStartDate || new Date().toISOString().slice(0, 10)

    if (driverAction === "change") {
      await supabase
        .from("car_drivers")
        .update({ active: false, end_date: startDate })
        .eq("car_id", id)
        .eq("driver_type", "primary")
        .eq("active", true)

      await supabase.from("car_drivers").insert([
        {
          car_id: id,
          driver_name: newDriverName,
          driver_type: "primary",
          active: true,
          start_date: startDate,
          shift_time: shiftTime || null,
        },
      ])

      await supabase
        .from("cars")
        .update({ driver_name: newDriverName })
        .eq("id", id)

      fetchVehicle()
    } else {
      await supabase.from("car_drivers").insert([
        {
          car_id: id,
          driver_name: newDriverName,
          driver_type: "additional",
          active: true,
          start_date: startDate,
          shift_time: shiftTime || null,
        },
      ])
    }

    setNewDriverName("")
    setDriverStartDate("")
    setShiftTime("")
    setDriverAction("change")
    fetchDrivers()
  }

  const filteredMaintenanceRecords = maintenanceRecords.filter((record) => {
    if (maintenanceFilter === "all") return true
    return record.type === maintenanceFilter
  })

  if (loading) return <div className="p-10">{t.loading}</div>
  if (!vehicle) return <div className="p-10">{t.notFound}</div>

  return (
    <main
      className="min-h-screen bg-gray-100 p-4 md:p-8"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="bg-white p-5 md:p-8 rounded-3xl shadow">
        <div className="flex justify-between mb-6">
          <a href="/" className="bg-gray-700 text-white px-4 py-2 rounded-xl">
            {t.back}
          </a>

          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="bg-black text-white px-4 py-2 rounded-xl"
          >
            {lang === "ar" ? "English" : "العربية"}
          </button>
        </div>

        <div className="mb-4 bg-gray-100 p-4 rounded-2xl">
          <strong>{t.role}: </strong>
          {role === "admin" ? t.admin : t.supervisor}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          {vehicle.vehicle_type === "motorcycle" ? "🏍️" : "🚗"} {t.details}
        </h1>

        <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Info title={t.type} value={vehicle.vehicle_type === "motorcycle" ? t.motorcycle : t.car} />
          <Info title={t.plate} value={vehicle.plate_number} />
          <Info title={t.model} value={vehicle.car_model} />
          <Info title={t.color} value={vehicle.color} />
          <Info title={t.driver} value={vehicle.driver_name} />
          <Info title={t.odometer} value={`${vehicle.current_km} KM`} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <TabButton active={activeSection === "maintenance"} onClick={() => setActiveSection("maintenance")}>🔧 {t.maintenance}</TabButton>
          <TabButton active={activeSection === "breakdowns"} onClick={() => setActiveSection("breakdowns")}>⚠️ {t.breakdowns}</TabButton>
          <TabButton active={activeSection === "accidents"} onClick={() => setActiveSection("accidents")}>🚨 {t.accidents}</TabButton>
          <TabButton active={activeSection === "drivers"} onClick={() => setActiveSection("drivers")}>👨‍🔧 {t.drivers}</TabButton>
        </div>

        {activeSection === "maintenance" && (
          <section className="border p-5 rounded-2xl">
            <h3 className="text-2xl font-bold mb-5">{t.maintenance}</h3>

            <div className="grid md:grid-cols-4 gap-3 mb-6">
              <select value={maintenanceType} onChange={(e) => setMaintenanceType(e.target.value)} className="border p-3 rounded-xl">
                <option value="oil_change">{t.oilChange}</option>
                <option value="consumable_part">{t.consumablePart}</option>
              </select>

              <input type="date" value={maintenanceDate} onChange={(e) => setMaintenanceDate(e.target.value)} className="border p-3 rounded-xl" />

              {maintenanceType === "oil_change" && (
                <>
                  <input type="number" placeholder={t.odometer} value={maintenanceKm} onChange={(e) => setMaintenanceKm(e.target.value)} className="border p-3 rounded-xl" />
                  <select value={oilFilterChanged} onChange={(e) => setOilFilterChanged(e.target.value)} className="border p-3 rounded-xl">
                    <option value="no">{t.filterNotChanged}</option>
                    <option value="yes">{t.filterChanged}</option>
                  </select>
                </>
              )}

              {maintenanceType === "consumable_part" && (
                <>
                  <input placeholder={t.partName} value={maintenanceDesc} onChange={(e) => setMaintenanceDesc(e.target.value)} className="border p-3 rounded-xl" />
                  <input type="number" placeholder={t.cost} value={maintenanceCost} onChange={(e) => setMaintenanceCost(e.target.value)} className="border p-3 rounded-xl" />
                </>
              )}
            </div>

            <button onClick={addMaintenance} className="bg-green-600 text-white px-6 py-3 rounded-xl mb-6">
              {t.save}
            </button>

            <select value={maintenanceFilter} onChange={(e) => setMaintenanceFilter(e.target.value)} className="border p-3 rounded-xl mb-4">
              <option value="all">{t.all}</option>
              <option value="oil_change">{t.oilChange}</option>
              <option value="consumable_part">{t.consumablePart}</option>
            </select>

            <Timeline>
              {filteredMaintenanceRecords.map((record) => (
                <TimelineItem key={record.id} title={record.type === "oil_change" ? t.oilChange : t.consumablePart} date={record.service_date}>
                  {record.type === "oil_change" && (
                    <>
                      <p><strong>{t.odometer}:</strong> {record.odometer_km} KM</p>
                      <p><strong>{record.oil_filter_changed ? t.filterChanged : t.filterNotChanged}</strong></p>
                    </>
                  )}

                  {record.type === "consumable_part" && (
                    <>
                      <p><strong>{t.partName}:</strong> {record.description}</p>
                      <p><strong>{t.cost}:</strong> {record.cost}</p>
                    </>
                  )}

                  {canEditDelete && (
                    <button onClick={() => deleteRecord("maintenance_records", record.id)} className="bg-red-600 text-white px-3 py-2 rounded-xl mt-3">
                      {t.delete}
                    </button>
                  )}
                </TimelineItem>
              ))}
            </Timeline>
          </section>
        )}

        {activeSection === "breakdowns" && (
          <section className="border p-5 rounded-2xl">
            <h3 className="text-2xl font-bold mb-5">{t.breakdowns}</h3>

            <div className="grid md:grid-cols-3 gap-3 mb-6">
              <input type="date" value={breakdownDate} onChange={(e) => setBreakdownDate(e.target.value)} className="border p-3 rounded-xl" />
              <input placeholder={t.breakdownDesc} value={breakdownDesc} onChange={(e) => setBreakdownDesc(e.target.value)} className="border p-3 rounded-xl" />
              <input type="number" placeholder={t.cost} value={breakdownCost} onChange={(e) => setBreakdownCost(e.target.value)} className="border p-3 rounded-xl" />
            </div>

            <button onClick={addBreakdown} className="bg-green-600 text-white px-6 py-3 rounded-xl mb-6">
              {t.save}
            </button>

            <Timeline>
              {breakdownRecords.map((record) => (
                <TimelineItem key={record.id} title={t.breakdowns} date={record.breakdown_date}>
                  <p><strong>{t.breakdownDesc}:</strong> {record.description}</p>
                  <p><strong>{t.cost}:</strong> {record.cost}</p>

                  {canEditDelete && (
                    <button onClick={() => deleteRecord("breakdown_records", record.id)} className="bg-red-600 text-white px-3 py-2 rounded-xl mt-3">
                      {t.delete}
                    </button>
                  )}
                </TimelineItem>
              ))}
            </Timeline>
          </section>
        )}

        {activeSection === "accidents" && (
          <section className="border p-5 rounded-2xl">
            <h3 className="text-2xl font-bold mb-5">{t.accidents}</h3>

            <div className="grid md:grid-cols-3 gap-3 mb-6">
              <input type="date" value={accidentDate} onChange={(e) => setAccidentDate(e.target.value)} className="border p-3 rounded-xl" />

              <select value={accidentDriver} onChange={(e) => setAccidentDriver(e.target.value)} className="border p-3 rounded-xl">
                <option value="">{t.selectDriver}</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.driver_name}>
                    {driver.driver_name}
                  </option>
                ))}
              </select>

              <input placeholder={t.accidentDesc} value={accidentDesc} onChange={(e) => setAccidentDesc(e.target.value)} className="border p-3 rounded-xl" />
              <input type="number" placeholder={t.faultPercent} value={faultPercent} onChange={(e) => setFaultPercent(e.target.value)} className="border p-3 rounded-xl" />
              <input type="number" placeholder={t.cost} value={accidentCost} onChange={(e) => setAccidentCost(e.target.value)} className="border p-3 rounded-xl" />

              <div className="border rounded-xl p-4 bg-white">
                <label className="cursor-pointer flex items-center justify-center gap-2 bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition">
                  📷 {t.accidentImage}

                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    hidden
                    onChange={(e) => setAccidentFile(e.target.files?.[0] || null)}
                  />
                </label>

                {accidentFile && (
                  <div className="mt-4">
                    <img
                      src={URL.createObjectURL(accidentFile)}
                      alt="preview"
                      className="w-48 rounded-xl border"
                    />

                    <p className="text-sm text-gray-500 mt-2">
                      {accidentFile.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button onClick={addAccident} className="bg-green-600 text-white px-6 py-3 rounded-xl mb-6">
              {t.save}
            </button>

            <Timeline>
              {accidentRecords.map((record) => (
                <TimelineItem key={record.id} title={t.accidents} date={record.accident_date}>
                  <p><strong>{t.driver}:</strong> {record.driver_name}</p>
                  <p><strong>{t.accidentDesc}:</strong> {record.description}</p>
                  <p><strong>{t.faultPercent}:</strong> {record.driver_fault_percent}%</p>
                  <p><strong>{t.cost}:</strong> {record.cost}</p>

                  {record.image_url && (
                    <img
                      src={record.image_url}
                      alt="Accident"
                      onClick={() => setPreviewImage(record.image_url)}
                      className="w-48 mt-3 rounded-xl border cursor-pointer hover:scale-105 transition"
                    />
                  )}

                  {canEditDelete && (
                    <button onClick={() => deleteRecord("accident_records", record.id)} className="bg-red-600 text-white px-3 py-2 rounded-xl mt-3">
                      {t.delete}
                    </button>
                  )}
                </TimelineItem>
              ))}
            </Timeline>
          </section>
        )}

        {activeSection === "drivers" && (
          <section className="border p-5 rounded-2xl">
            <h3 className="text-2xl font-bold mb-5">{t.drivers}</h3>

            <div className="grid md:grid-cols-4 gap-3 mb-6">
              <select value={driverAction} onChange={(e) => setDriverAction(e.target.value)} className="border p-3 rounded-xl">
                <option value="change">{t.changeMainDriver}</option>
                <option value="add">{t.addExtraDriver}</option>
              </select>

              <input placeholder={t.driverName} value={newDriverName} onChange={(e) => setNewDriverName(e.target.value)} className="border p-3 rounded-xl" />
              <input type="date" value={driverStartDate} onChange={(e) => setDriverStartDate(e.target.value)} className="border p-3 rounded-xl" />
              <input placeholder={t.shiftOptional} value={shiftTime} onChange={(e) => setShiftTime(e.target.value)} className="border p-3 rounded-xl" />
            </div>

            <button onClick={saveDriver} className="bg-green-600 text-white px-6 py-3 rounded-xl mb-6">
              {t.save}
            </button>

            <Timeline>
              {drivers.map((driver) => (
                <TimelineItem key={driver.id} title={driver.driver_name} date={driver.start_date || "-"}>
                  <p><strong>{t.type}:</strong> {driver.driver_type === "primary" ? t.primary : t.additional}</p>
                  <p><strong>{t.shiftOptional}:</strong> {driver.shift_time || "-"}</p>
                  <p><strong>{driver.active ? t.active : t.inactive}</strong></p>

                  {canEditDelete && (
                    <button onClick={() => deleteRecord("car_drivers", driver.id)} className="bg-red-600 text-white px-3 py-2 rounded-xl mt-3">
                      {t.delete}
                    </button>
                  )}
                </TimelineItem>
              ))}
            </Timeline>
          </section>
        )}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage("")}
        >
          <img
            src={previewImage}
            alt={t.imagePreview}
            className="max-w-full max-h-full rounded-2xl"
          />
        </div>
      )}
    </main>
  )
}

function Info({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-gray-100 p-5 rounded-2xl">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-xl font-bold">{value || "-"}</h2>
    </div>
  )
}

function TabButton({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl ${
        active ? "bg-teal-500 text-black font-bold" : "bg-black text-white"
      }`}
    >
      {children}
    </button>
  )
}

function Timeline({ children }: any) {
  return (
    <div className="relative border-r-4 border-teal-500 pr-6 space-y-5">
      {children}
    </div>
  )
}

function TimelineItem({ title, date, children }: any) {
  return (
    <div className="relative bg-gray-50 border rounded-2xl p-5 shadow-sm">
      <span className="absolute -right-[35px] top-5 w-5 h-5 bg-teal-500 rounded-full border-4 border-white"></span>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-2">
        <h4 className="font-bold text-lg">{title}</h4>
        <span className="text-sm text-gray-500">{date}</span>
      </div>

      <div className="space-y-2 text-gray-700">
        {children}
      </div>
    </div>
  )
}