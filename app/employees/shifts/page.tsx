"use client";



import {

  useEffect,

  useMemo,

  useRef,

  useState,

  type ChangeEvent,

  type ReactNode,

} from "react";



import {

  AlertCircle,

  CalendarDays,

  Check,

  Clock3,

  FileSpreadsheet,

  RefreshCw,

  Search,

  Trash2,

  Upload,

  UserRound,

  Users,
  X,

} from "lucide-react";



import AppLayout, {

  useLanguage,

} from "../../../components/AppLayout";



import { supabase } from "../../lib/supabase";



/* =========================================================

   TYPES

========================================================= */



type Employee = {

  id: string;



  name: string | null;



  hunger_id: string | null;



  keeta_id: string | null;

  status: string | null;

};



type ShiftRecord = {

  riderId: string;



  date: string;



  hours: number;

};



type SelectedShift = {
  riderId: string;
  name: string | null;
  date: string;
  hours: number;
};

type SavedReport = {

  fileName: string;



  importedAt: string;



  rows: ShiftRecord[];

};



type RiderSummary = {

  riderId: string;



  name: string | null;



  shifts: Map<

    string,

    number

  >;

};



type PastRange =

  | 7

  | 14

  | 30

  | "all";



/* =========================================================

   CONSTANTS

========================================================= */



const STORAGE_KEY =

  "nemow-rider-scheduled-shifts-report-v2";



/* =========================================================

   PAGE

========================================================= */



export default function RiderShiftsPage() {

  return (

    <AppLayout system="employees">

      <RiderShiftReportContent />

    </AppLayout>

  );

}



/* =========================================================

   CONTENT

========================================================= */



function RiderShiftReportContent() {

  const { lang } =

    useLanguage();



  const isAr =

    lang === "ar";



  const fileInputRef =

    useRef<HTMLInputElement | null>(

      null

    );



  const [employees, setEmployees] =

    useState<Employee[]>([]);



  const [records, setRecords] =

    useState<ShiftRecord[]>([]);



  const [fileName, setFileName] =

    useState("");



  const [

    importedAt,

    setImportedAt,

  ] = useState("");



  const [search, setSearch] =

    useState("");



  const [

    pastRange,

    setPastRange,

  ] = useState<PastRange>(7);



  const [

    loadingEmployees,

    setLoadingEmployees,

  ] = useState(true);



  const [

    readingFile,

    setReadingFile,

  ] = useState(false);



  const [error, setError] =

    useState("");



  const [selectedShift, setSelectedShift] =
    useState<SelectedShift | null>(null);

  const todayKey =

    getSaudiDateKey();



  /* =========================================================

     INITIAL LOAD

  ========================================================= */



  useEffect(() => {

    loadEmployees();

    restoreSavedReport();

  }, []);



  /* =========================================================

     EMPLOYEES

  ========================================================= */



  useEffect(() => {
    if (!selectedShift) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedShift(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedShift]);

  async function loadEmployees() {

    try {

      setLoadingEmployees(

        true

      );



      const {

        data,

        error:

          employeeError,

      } = await supabase

        .from("employees")

        .select(

          "id,name,hunger_id,keeta_id,status"

        )

        .order("name", {

          ascending: true,

        });



      if (employeeError) {

        throw employeeError;

      }



      setEmployees(

        (data || []) as Employee[]

      );

    } catch (loadError) {

      console.error(

        "LOAD EMPLOYEES ERROR:",

        loadError

      );

    } finally {

      setLoadingEmployees(

        false

      );

    }

  }



  /* =========================================================

     RESTORE REPORT

  ========================================================= */



  function restoreSavedReport() {

    try {

      const saved =

        localStorage.getItem(

          STORAGE_KEY

        );



      if (!saved) {

        return;

      }



      const parsed =

        JSON.parse(

          saved

        ) as SavedReport;



      if (

        !Array.isArray(

          parsed.rows

        )

      ) {

        return;

      }



      setRecords(

        parsed.rows

      );



      setFileName(

        parsed.fileName || ""

      );



      setImportedAt(

        parsed.importedAt || ""

      );

    } catch (restoreError) {

      console.error(

        "RESTORE SHIFT REPORT ERROR:",

        restoreError

      );

    }

  }



  /* =========================================================

     FILE

  ========================================================= */



  async function handleFile(

    event: ChangeEvent<HTMLInputElement>

  ) {

    const file =

      event.target.files?.[0];



    event.target.value = "";



    if (!file) {

      return;

    }



    try {

      setReadingFile(true);

      setError("");



      const text =

        await file.text();



      const parsedRows =

        parseScheduledShiftCsv(

          text

        );



      if (

        parsedRows.length ===

        0

      ) {

        throw new Error(

          isAr

            ? "لم يتم العثور على بيانات شفتات صحيحة داخل الملف."

            : "No valid shift data was found in the file."

        );

      }



      const normalizedRows =

        aggregateRecords(

          parsedRows

        );



      const savedReport:

        SavedReport = {

        fileName:

          file.name,



        importedAt:

          new Date().toISOString(),



        rows:

          normalizedRows,

      };



      localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(

          savedReport

        )

      );



      setRecords(

        normalizedRows

      );



      setFileName(

        file.name

      );



      setImportedAt(

        savedReport.importedAt

      );

    } catch (fileError) {

      console.error(

        "READ SHIFT FILE ERROR:",

        fileError

      );



      setError(

        fileError instanceof

          Error

          ? fileError.message

          : isAr

            ? "تعذر قراءة الملف."

            : "Unable to read file."

      );

    } finally {

      setReadingFile(false);

    }

  }



  /* =========================================================

     CLEAR

  ========================================================= */



  function clearReport() {

    const confirmed =

      window.confirm(

        isAr

          ? "هل تريد مسح تقرير الشفتات الحالي؟"

          : "Delete the current shift report?"

      );



    if (!confirmed) {

      return;

    }



    localStorage.removeItem(

      STORAGE_KEY

    );



    setRecords([]);

    setFileName("");

    setImportedAt("");

    setSearch("");

    setError("");

  }



  /* =========================================================

     EMPLOYEE NAME MAP

  ========================================================= */



  const employeeByRiderId =

    useMemo(() => {

      const map =

        new Map<

          string,

          Employee

        >();



      employees.forEach(

        (employee) => {

          const hungerId =

            normalizeId(

              employee.hunger_id

            );



          const keetaId =

            normalizeId(

              employee.keeta_id

            );



          if (hungerId) {

            map.set(

              hungerId,

              employee

            );

          }



          /*

            Fallback فقط لو التقرير

            جاي مستقبلاً من منصة أخرى.

          */



          if (

            keetaId &&

            !map.has(keetaId)

          ) {

            map.set(

              keetaId,

              employee

            );

          }

        }

      );



      return map;

    }, [employees]);



  /*

    Exclude employees whose status is stopped/inactive

    or out of service. Vacation remains visible.

  */

  const reportRecords =

    useMemo(

      () =>

        loadingEmployees

          ? []

          : records.filter((record) => {

          const employee =

            employeeByRiderId.get(

              normalizeId(record.riderId)

            );



          return !employee || !isExcludedRiderStatus(employee.status);

        }),

      [records, employeeByRiderId, loadingEmployees]

    );



  /* =========================================================

     RIDERS

  ========================================================= */



  const riders =

    useMemo<

      RiderSummary[]

    >(() => {

      const map =

        new Map<

          string,

          Map<string, number>

        >();



      reportRecords.forEach(

        (record) => {

          const riderMap =

            map.get(

              record.riderId

            ) ??

            new Map<

              string,

              number

            >();



          riderMap.set(

            record.date,

            (

              riderMap.get(

                record.date

              ) ?? 0

            ) + record.hours

          );



          map.set(

            record.riderId,

            riderMap

          );

        }

      );



      return Array.from(

        map.entries()

      )

        .map(

          ([

            riderId,

            shifts,

          ]) => ({

            riderId,



            name:

              employeeByRiderId.get(

                normalizeId(riderId)

              )?.name ??

              null,



            shifts,

          })

        )

        .sort(

          (a, b) => {

            const aName =

              a.name || "";



            const bName =

              b.name || "";



            if (

              aName &&

              bName

            ) {

              return aName.localeCompare(

                bName,

                isAr

                  ? "ar"

                  : "en"

              );

            }



            if (aName) {

              return -1;

            }



            if (bName) {

              return 1;

            }



            return Number(

              a.riderId

            ) -

              Number(

                b.riderId

              );

          }

        );

    }, [

      reportRecords,

      employeeByRiderId,

      isAr,

    ]);



  /* =========================================================

     DATE RANGE

  ========================================================= */



  const reportDates =

    useMemo(

      () =>

        Array.from(

          new Set(

            reportRecords.map(

              (record) =>

                record.date

            )

          )

        ).sort(),

      [reportRecords]

    );



  const firstReportDate =

    reportDates[0] ??

    null;



  const lastReportDate =

    reportDates[

      reportDates.length - 1

    ] ?? null;



  /*

    المطلوب:

    أيام قبل اليوم + اليوم + جميع الأيام القادمة

    الموجودة داخل التقرير.

  */



  const visibleDates =

    useMemo(() => {

      if (

        reportDates.length ===

        0

      ) {

        return [];

      }



      let startDate =

        firstReportDate ||

        todayKey;



      if (

        pastRange !== "all"

      ) {

        startDate =

          addDaysToDateKey(

            todayKey,

            -pastRange

          );



        if (

          firstReportDate &&

          startDate <

            firstReportDate

        ) {

          startDate =

            firstReportDate;

        }

      }



      /*

        اليوم يظهر دائمًا،

        وحتى آخر تاريخ حجز موجود.

      */



      const endDate =

        lastReportDate &&

        lastReportDate >

          todayKey

          ? lastReportDate

          : todayKey;



      return createDateRange(

        startDate,

        endDate

      );

    }, [

      reportDates,

      firstReportDate,

      lastReportDate,

      todayKey,

      pastRange,

    ]);



  /* =========================================================

     FILTER RIDERS

  ========================================================= */



  const filteredRiders =

    useMemo(() => {

      const query =

        search

          .trim()

          .toLowerCase();



      if (!query) {

        return riders;

      }



      return riders.filter(

        (rider) => {

          return (

            rider.riderId

              .toLowerCase()

              .includes(

                query

              ) ||

            String(

              rider.name || ""

            )

              .toLowerCase()

              .includes(

                query

              )

          );

        }

      );

    }, [

      riders,

      search,

    ]);



  /* =========================================================

     KPIS

  ========================================================= */



  const bookedToday =

    useMemo(

      () =>

        riders.filter(

          (rider) =>

            (

              rider.shifts.get(

                todayKey

              ) ?? 0

            ) > 0

        ).length,

      [

        riders,

        todayKey,

      ]

    );



  const underTenToday =

    useMemo(

      () =>

        riders.filter(

          (rider) => {

            const hours =

              rider.shifts.get(

                todayKey

              ) ?? 0;



            return (

              hours > 0 &&

              hours < 10

            );

          }

        ).length,

      [

        riders,

        todayKey,

      ]

    );



  const ridersWithFutureBooking =

    useMemo(

      () =>

        riders.filter(

          (rider) =>

            Array.from(

              rider.shifts.entries()

            ).some(

              ([

                date,

                hours,

              ]) =>

                date >

                  todayKey &&

                hours > 0

            )

        ).length,

      [

        riders,

        todayKey,

      ]

    );



  const ridersWithoutFutureBooking =

    riders.length -

    ridersWithFutureBooking;



  /* =========================================================

     UI

  ========================================================= */



  return (

    <div

      dir={

        isAr

          ? "rtl"

          : "ltr"

      }

      className="space-y-5 pb-10"

    >



      {/* =====================================================

          HEADER

      ===================================================== */}



      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">



        <div className="h-1 bg-[#0f7280]" />



        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">



          <div>



            <p className="text-xs font-black text-[#0f7280]">

              {isAr

                ? "إدارة المناديب"

                : "Rider Operations"}

            </p>



            <h1 className="mt-2 text-2xl font-black text-[#102a4c] md:text-3xl">

              {isAr

                ? "الشفتات المحجوزة"

                : "Booked Shifts"}

            </h1>



            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">

              {isAr

                ? "متابعة حجز شفتات المناديب يومًا بيوم وعدد ساعات كل شفت."

                : "Track rider shift bookings day by day and view planned working hours."}

            </p>



          </div>



          <button

            type="button"

            disabled={

              readingFile

            }

            onClick={() =>

              fileInputRef.current?.click()

            }

            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0f7280] px-5 text-sm font-black text-white transition hover:bg-[#0b5d68] disabled:opacity-60"

          >

            {readingFile ? (

              <RefreshCw className="h-5 w-5 animate-spin" />

            ) : (

              <Upload className="h-5 w-5" />

            )}



            {readingFile

              ? isAr

                ? "جاري قراءة الملف..."

                : "Reading file..."

              : records.length >

                  0

                ? isAr

                  ? "رفع ملف جديد"

                  : "Upload New File"

                : isAr

                  ? "رفع تقرير الشفتات"

                  : "Upload Shift Report"}



          </button>



          <input

            ref={fileInputRef}

            type="file"

            accept=".csv,text/csv"

            className="hidden"

            onChange={

              handleFile

            }

          />



        </div>



      </section>



      {/* =====================================================

          FILE INFORMATION

      ===================================================== */}



      {records.length > 0 && (

        <section className="flex flex-col gap-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">



          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">



            <FileSpreadsheet className="h-5 w-5" />



          </span>



          <div className="min-w-0 flex-1">



            <p

              dir="ltr"

              className={`truncate text-sm font-black text-[#102a4c] ${

                isAr

                  ? "text-right"

                  : "text-left"

              }`}

            >

              {fileName}

            </p>



            <p className="mt-1 text-xs font-semibold text-slate-400">

              {isAr

                ? `${reportRecords.length.toLocaleString(

                    "ar-SA"

                  )} سجل شفت`

                : `${reportRecords.length.toLocaleString(

                    "en-US"

                  )} shift records`}



              {importedAt

                ? ` · ${

                    isAr

                      ? "آخر رفع"

                      : "Uploaded"

                  } ${formatDateTime(

                    importedAt,

                    isAr

                  )}`

                : ""}

            </p>



          </div>



          <button

            type="button"

            onClick={

              clearReport

            }

            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-black text-red-600 transition hover:bg-red-100"

          >



            <Trash2 className="h-4 w-4" />



            {isAr

              ? "مسح التقرير"

              : "Clear Report"}



          </button>



        </section>

      )}



      {/* =====================================================

          ERROR

      ===================================================== */}



      {error && (

        <section className="flex items-start gap-3 rounded-[18px] border border-red-200 bg-red-50 p-4">



          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />



          <p className="text-sm font-bold text-red-700">

            {error}

          </p>



        </section>

      )}



      {/* =====================================================

          EMPTY

      ===================================================== */}



      {records.length === 0 ? (

        <section className="rounded-[24px] border border-slate-200 bg-white p-7 shadow-sm">



          <button

            type="button"

            onClick={() =>

              fileInputRef.current?.click()

            }

            className="flex min-h-[330px] w-full flex-col items-center justify-center rounded-[22px] border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition hover:border-[#0f7280] hover:bg-[#0f7280]/[0.03]"

          >



            <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#0f7280]/10 text-[#0f7280]">



              <FileSpreadsheet className="h-8 w-8" />



            </span>



            <h2 className="mt-5 text-xl font-black text-[#102a4c]">

              {isAr

                ? "ارفع تقرير الشفتات"

                : "Upload Shift Report"}

            </h2>



            <p className="mt-2 text-sm font-semibold text-slate-500">

              3PL Report — Scheduled Shift - Planned

            </p>



            <p className="mt-1 text-xs font-semibold text-slate-400">

              CSV

            </p>



          </button>



        </section>

      ) : (

        <>

          {/* =================================================

              KPIS

          ================================================= */}



          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">



            <StatCard

              icon={

                <Users className="h-5 w-5" />

              }

              label={

                isAr

                  ? "مناديب التقرير"

                  : "Report Riders"

              }

              value={

                riders.length

              }

              tone="blue"

            />



            <StatCard

              icon={

                <Check className="h-5 w-5" />

              }

              label={

                isAr

                  ? "حاجزين اليوم"

                  : "Booked Today"

              }

              value={

                bookedToday

              }

              tone="green"

            />



            <StatCard

              icon={

                <Clock3 className="h-5 w-5" />

              }

              label={

                isAr

                  ? "أقل من 10 ساعات اليوم"

                  : "Under 10h Today"

              }

              value={

                underTenToday

              }

              tone="orange"

            />



            <StatCard

              icon={

                <CalendarDays className="h-5 w-5" />

              }

              label={

                isAr

                  ? "لديهم حجز قادم"

                  : "Future Booking"

              }

              value={

                ridersWithFutureBooking

              }

              tone="teal"

            />



            <StatCard

              icon={

                <AlertCircle className="h-5 w-5" />

              }

              label={

                isAr

                  ? "بدون حجز قادم"

                  : "No Future Booking"

              }

              value={

                ridersWithoutFutureBooking

              }

              tone={

                ridersWithoutFutureBooking >

                0

                  ? "red"

                  : "green"

              }

            />



          </section>



          {/* =================================================

              FILTERS

          ================================================= */}



          <section className="rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm">



            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">



              {/* SEARCH */}



              <div className="relative flex-1">



                <Search

                  className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 ${

                    isAr

                      ? "right-4"

                      : "left-4"

                  }`}

                />



                <input

                  value={search}

                  onChange={(

                    event

                  ) =>

                    setSearch(

                      event.target.value

                    )

                  }

                  placeholder={

                    isAr

                      ? "ابحث باسم المندوب أو Rider ID..."

                      : "Search rider name or Rider ID..."

                  }

                  className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#102a4c] outline-none transition focus:border-[#0f7280] focus:bg-white ${

                    isAr

                      ? "pr-12 pl-4"

                      : "pl-12 pr-4"

                  }`}

                />



              </div>



              {/* RANGE */}



              <div className="flex flex-wrap items-center gap-2">

                <span className="px-1 text-xs font-black text-slate-500">

                  {isAr ? "الفترة:" : "Range:"}

                </span>

                <div
                  role="group"
                  aria-label={isAr ? "تصفية الفترة" : "Filter date range"}
                  className="flex flex-wrap gap-2"
                >



                <RangeButton

                  active={

                    pastRange === 7

                  }

                  onClick={() =>

                    setPastRange(7)

                  }

                >

                  {isAr

                    ? "7 أيام سابقة + القادم"

                    : "Past 7 Days + Future"}

                </RangeButton>



                <RangeButton

                  active={

                    pastRange ===

                    14

                  }

                  onClick={() =>

                    setPastRange(14)

                  }

                >

                  {isAr

                    ? "14 يوم سابق + القادم"

                    : "Past 14 Days + Future"}

                </RangeButton>



                <RangeButton

                  active={

                    pastRange ===

                    30

                  }

                  onClick={() =>

                    setPastRange(30)

                  }

                >

                  {isAr

                    ? "30 يوم سابق + القادم"

                    : "Past 30 Days + Future"}

                </RangeButton>



                <RangeButton

                  active={

                    pastRange ===

                    "all"

                  }

                  onClick={() =>

                    setPastRange(

                      "all"

                    )

                  }

                >

                  {isAr

                    ? "كل التقرير"

                    : "All Report"}

                </RangeButton>



                </div>



              </div>



            </div>



          </section>



          {/* =================================================

              LEGEND

          ================================================= */}



          <section className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-sm">



            <LegendItem

              tone="green"

              text={

                isAr

                  ? "10 ساعات أو أكثر"

                  : "10 hours or more"

              }

            />



            <LegendItem

              tone="orange"

              text={

                isAr

                  ? "أقل من 10 ساعات"

                  : "Less than 10 hours"

              }

            />



            <div className="flex items-center gap-2">



              <span className="text-lg font-black text-slate-300">

                —

              </span>



              <span className="text-xs font-black text-slate-500">

                {isAr

                  ? "لا يوجد حجز"

                  : "No Booking"}

              </span>



            </div>



            <div className="ms-auto text-xs font-bold text-slate-400">



              {isAr

                ? "اليوم الحالي:"

                : "Today:"}{" "}



              <strong className="text-[#0f7280]">

                {formatDateHeader(

                  todayKey,

                  isAr

                )}

              </strong>



            </div>



          </section>



          {/* =================================================

              TABLE

          ================================================= */}



          <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">



            <div className="border-b border-slate-100 px-5 py-4">



              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">



                <div>



                  <h2 className="text-lg font-black text-[#102a4c]">

                    {isAr

                      ? "جدول حجز الشفتات"

                      : "Shift Booking Schedule"}

                  </h2>



                  <p className="mt-1 text-xs font-semibold text-slate-400">

                    {isAr

                      ? `${filteredRiders.length} مندوب · من ${formatDateShort(

                          visibleDates[

                            0

                          ],

                          true

                        )} إلى ${formatDateShort(

                          visibleDates[

                            visibleDates.length -

                              1

                          ],

                          true

                        )}`

                      : `${filteredRiders.length} riders · ${formatDateShort(

                          visibleDates[

                            0

                          ],

                          false

                        )} to ${formatDateShort(

                          visibleDates[

                            visibleDates.length -

                              1

                          ],

                          false

                        )}`}

                  </p>



                </div>



                {loadingEmployees && (

                  <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400">



                    <RefreshCw className="h-4 w-4 animate-spin" />



                    {isAr

                      ? "جاري ربط أسماء المناديب..."

                      : "Loading rider names..."}



                  </div>

                )}



              </div>



            </div>



            <div className="max-w-full overflow-x-auto">



              <table className="w-max min-w-full border-separate border-spacing-0">



                <thead>



                  <tr>



                    {/* EMPLOYEE */}



                    <th

                      className={`

                        sticky

                        z-30

                        min-w-[250px]

                        border-b

                        border-slate-200

                        bg-[#f7fafc]

                        px-4

                        py-4

                        text-start

                        text-sm

                        font-black

                        text-[#102a4c]



                        ${

                          isAr

                            ? "right-0 border-l"

                            : "left-0 border-r"

                        }

                      `}

                    >

                      {isAr

                        ? "المندوب"

                        : "Rider"}

                    </th>



                    {/* DATES */}



                    {visibleDates.map(

                      (date) => {

                        const isToday =

                          date ===

                          todayKey;



                        const future =

                          date >

                          todayKey;



                        return (

                          <th

                            key={

                              date

                            }

                            className={`

                              min-w-[100px]

                              border-b

                              border-slate-200

                              px-2

                              py-3

                              text-center



                              ${

                                isToday

                                  ? "bg-cyan-50"

                                  : future

                                    ? "bg-blue-50/40"

                                    : "bg-[#f7fafc]"

                              }

                            `}

                          >



                            <p

                              className={`text-xs font-black ${

                                isToday

                                  ? "text-[#0f7280]"

                                  : future

                                    ? "text-blue-700"

                                    : "text-slate-600"

                              }`}

                            >

                              {getWeekdayName(

                                date,

                                isAr

                              )}

                            </p>



                            <p

                              className={`mt-1 text-xs font-black ${

                                isToday

                                  ? "text-[#0f7280]"

                                  : "text-slate-400"

                              }`}

                            >

                              {formatDateShort(

                                date,

                                isAr

                              )}

                            </p>



                            {isToday && (

                              <span className="mt-1.5 inline-flex rounded-full bg-[#0f7280] px-2 py-0.5 text-[10px] font-black text-white">

                                {isAr

                                  ? "اليوم"

                                  : "Today"}

                              </span>

                            )}



                            {future && (

                              <span className="mt-1.5 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-black text-blue-600">

                                {isAr

                                  ? "قادم"

                                  : "Future"}

                              </span>

                            )}



                          </th>

                        );

                      }

                    )}



                  </tr>



                </thead>



                <tbody>



                  {filteredRiders.map(

                    (

                      rider,

                      riderIndex

                    ) => (

                      <tr

                        key={

                          rider.riderId

                        }

                        className={

                          riderIndex %

                            2 ===

                          0

                            ? "bg-white"

                            : "bg-slate-50/40"

                        }

                      >



                        {/* NAME + RIDER ID */}



                        <td

                          className={`

                            sticky

                            z-20

                            border-b

                            border-slate-100

                            px-4

                            py-3



                            ${

                              riderIndex %

                                2 ===

                              0

                                ? "bg-white"

                                : "bg-[#fafcfd]"

                            }



                            ${

                              isAr

                                ? "right-0 border-l border-slate-200"

                                : "left-0 border-r border-slate-200"

                            }

                          `}

                        >



                          <div className="flex min-w-0 items-center gap-3">



                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f7280]/10 text-[#0f7280]">



                              <UserRound className="h-5 w-5" />



                            </span>



                            <div className="min-w-0">



                              <p
                                title={rider.name || undefined}
                                className="max-w-[200px] whitespace-normal break-words text-sm font-black leading-5 text-[#102a4c]"
                              >

                                {getFirstTwoNames(rider.name) ||

                                  (

                                    isAr

                                      ? "الاسم غير مربوط"

                                      : "Name Not Linked"

                                  )}

                              </p>



                              <p

                                dir="ltr"

                                className={`mt-1 text-xs font-black text-slate-400 ${

                                  isAr

                                    ? "text-right"

                                    : "text-left"

                                }`}

                              >

                                Rider ID:{" "}

                                <span className="text-slate-600">

                                  {

                                    rider.riderId

                                  }

                                </span>

                              </p>



                            </div>



                          </div>



                        </td>



                        {/* DAYS */}



                        {visibleDates.map(

                          (date) => {

                            const hours =

                              rider.shifts.get(

                                date

                              ) ?? 0;



                            return (

                              <td

                                key={`${rider.riderId}-${date}`}

                                className={`

                                  border-b

                                  border-slate-100

                                  px-2

                                  py-3

                                  text-center



                                  ${

                                    date ===

                                    todayKey

                                      ? "bg-cyan-50/40"

                                      : date >

                                          todayKey

                                        ? "bg-blue-50/10"

                                        : ""

                                  }

                                `}

                              >



                                <ShiftCell
                                  onClick={() => setSelectedShift({
                                    riderId: rider.riderId,
                                    name: rider.name,
                                    date,
                                    hours,
                                  })}

                                  hours={

                                    hours

                                  }

                                  isAr={

                                    isAr

                                  }

                                />



                              </td>

                            );

                          }

                        )}



                      </tr>

                    )

                  )}



                </tbody>



              </table>



            </div>



            {filteredRiders.length ===

              0 && (

              <div className="flex min-h-[260px] flex-col items-center justify-center text-center">



                <Search className="h-8 w-8 text-slate-300" />



                <h3 className="mt-3 text-base font-black text-slate-600">

                  {isAr

                    ? riders.length === 0 && records.length > 0

                      ? "لا يوجد مندوب نشط في التقرير"

                      : "لا يوجد مندوب مطابق للبحث"

                    : riders.length === 0 && records.length > 0

                      ? "No active riders in this report"

                      : "No matching rider"}

                </h3>



              </div>

            )}



          </section>

        </>

      )}



    {selectedShift && (
      <ShiftDetailsDialog
        shift={selectedShift}
        isAr={isAr}
        onClose={() => setSelectedShift(null)}
      />
    )}

    </div>

  );

}



/* =========================================================

   SHIFT CELL

========================================================= */



function ShiftDetailsDialog({
  shift,
  isAr,
  onClose,
}: {
  shift: SelectedShift;
  isAr: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="shift-details-title"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="shift-details-title" className="text-lg font-black text-[#102a4c]">
            {isAr ? "تفاصيل شفت المندوب" : "Rider shift details"}
          </h2>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            aria-label={isAr ? "إغلاق" : "Close"}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f7280]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm font-bold text-[#102a4c]">
          {shift.name || (isAr ? "الاسم غير مربوط" : "Name not linked")}
        </p>
        <p dir="ltr" className={isAr ? "mt-1 text-right text-xs font-bold text-slate-500" : "mt-1 text-left text-xs font-bold text-slate-500"}>
          Rider ID: {shift.riderId}
        </p>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs font-bold text-slate-500">{isAr ? "اليوم" : "Date"}</dt>
            <dd className="mt-2 text-sm font-black text-[#102a4c]">
              {formatDateHeader(shift.date, isAr)}
            </dd>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4">
            <dt className="text-xs font-bold text-emerald-700">
              {isAr ? "إجمالي ساعات الشفت المخططة" : "Total planned shift hours"}
            </dt>
            <dd className="mt-2 text-lg font-black text-emerald-800">
              {formatHours(shift.hours, isAr)}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs font-semibold leading-6 text-slate-500">
          {isAr
            ? "ملف التقرير يحتوي إجمالي الساعات المخططة فقط؛ وقت بداية الشفت ونهايته غير متاحين فيه."
            : "This report contains total planned hours only; shift start and end times are not available in the file."}
        </p>
      </section>
    </div>
  );
}

function ShiftCell({

  hours,

  isAr,
  onClick,

}: {

  hours: number;



  isAr: boolean;
  onClick: () => void;

}) {

  if (

    !hours ||

    hours <= 0

  ) {

    return (

      <div className="flex min-h-[55px] items-center justify-center">



        <span className="text-xl font-black text-slate-200">

          —

        </span>



      </div>

    );

  }



  const complete =

    hours >= 10;



  return (

    <button
      type="button"
      onClick={onClick}
      title={isAr ? "عرض تفاصيل الشفت" : "View shift details"}
      aria-label={isAr ? "عرض تفاصيل الشفت" : "View shift details"}
      className="flex min-h-[55px] w-full cursor-pointer flex-col items-center justify-center rounded-xl px-1 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f7280]"
    >



      <span

        className={`

          flex

          h-8

          w-8

          items-center

          justify-center

          rounded-full



          ${

            complete

              ? "bg-emerald-100 text-emerald-700"

              : "bg-orange-100 text-orange-700"

          }

        `}

      >

        <Check

          className="h-5 w-5"

          strokeWidth={3}

        />

      </span>



      <strong

        className={`mt-1.5 whitespace-nowrap text-xs font-black ${

          complete

            ? "text-emerald-700"

            : "text-orange-700"

        }`}

      >

        {formatHours(

          hours,

          isAr

        )}

      </strong>



    </button>

  );

}



/* =========================================================

   STAT

========================================================= */



function StatCard({

  icon,

  label,

  value,

  tone,

}: {

  icon: ReactNode;



  label: string;



  value: number;



  tone:

    | "blue"

    | "green"

    | "orange"

    | "teal"

    | "red";

}) {

  const styles = {

    blue: {

      icon:

        "bg-blue-50 text-blue-600",



      value:

        "text-blue-700",

    },



    green: {

      icon:

        "bg-emerald-50 text-emerald-600",



      value:

        "text-emerald-700",

    },



    orange: {

      icon:

        "bg-orange-50 text-orange-600",



      value:

        "text-orange-700",

    },



    teal: {

      icon:

        "bg-cyan-50 text-[#0f7280]",



      value:

        "text-[#0f7280]",

    },



    red: {

      icon:

        "bg-red-50 text-red-600",



      value:

        "text-red-700",

    },

  }[tone];



  return (

    <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">



      <div className="flex items-center justify-between gap-3">



        <div>



          <p className="text-xs font-black text-slate-500">

            {label}

          </p>



          <strong

            className={`mt-2 block text-2xl font-black ${styles.value}`}

          >

            {value}

          </strong>



        </div>



        <span

          className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.icon}`}

        >

          {icon}

        </span>



      </div>



    </div>

  );

}



const EXCLUDED_RIDER_STATUSES = new Set([

  "stopped",

  "inactive",

  "notactive",

  "outofservice",

  "غيرنشط",

  "موقوف",

  "خارجالخدمة",

]);



function isExcludedRiderStatus(status: string | null) {

  const normalized = (status || "")

    .trim()

    .toLowerCase()

    .replace(/[\s_-]+/g, "");



  return EXCLUDED_RIDER_STATUSES.has(normalized);

}



function getFirstTwoNames(name: string | null) {

  return (name || "")

    .trim()

    .split(/\s+/)

    .filter(Boolean)

    .slice(0, 2)

    .join(" ");

}



/* =========================================================

   RANGE BUTTON

========================================================= */



function RangeButton({

  active,

  onClick,

  children,

}: {

  active: boolean;



  onClick: () => void;



  children: ReactNode;

}) {

  return (

    <button

      type="button"

      onClick={onClick}

      aria-pressed={active}

      className={`

        h-10

        rounded-xl

        border

        px-4

        text-xs

        font-black

        transition

        focus-visible:outline-none

        focus-visible:ring-2

        focus-visible:ring-[#0f7280]

        focus-visible:ring-offset-2

        ${

          active

            ? "border-[#0f7280] bg-[#0f7280] text-white"

            : "border-slate-200 bg-white text-slate-500 hover:border-[#0f7280]/40 hover:text-[#0f7280]"

        }

      `}

    >

      {children}

    </button>

  );

}



/* =========================================================

   LEGEND

========================================================= */



function LegendItem({

  tone,

  text,

}: {

  tone:

    | "green"

    | "orange";



  text: string;

}) {

  const green =

    tone === "green";



  return (

    <div className="flex items-center gap-2">



      <span

        className={`flex h-7 w-7 items-center justify-center rounded-full ${

          green

            ? "bg-emerald-100 text-emerald-700"

            : "bg-orange-100 text-orange-700"

        }`}

      >

        <Check

          className="h-4 w-4"

          strokeWidth={3}

        />

      </span>



      <span className="text-xs font-black text-slate-500">

        {text}

      </span>



    </div>

  );

}



/* =========================================================

   CSV PARSER

========================================================= */



function parseScheduledShiftCsv(

  text: string

): ShiftRecord[] {

  const normalizedText =

    text

      .replace(/^\uFEFF/, "")

      .replace(/\r\n/g, "\n")

      .replace(/\r/g, "\n");



  const lines =

    normalizedText

      .split("\n")

      .filter(

        (line) =>

          line.trim() !== ""

      );



  if (

    lines.length < 2

  ) {

    return [];

  }



  const headers =

    splitCsvLine(

      lines[0]

    ).map(

      normalizeHeader

    );



  const riderIndex =

    findHeaderIndex(

      headers,

      [

        "rider id",

        "riderid",

      ]

    );



  const dateIndex =

    findHeaderIndex(

      headers,

      [

        "created date",

        "date",

      ]

    );



  const hoursIndex =

    findHeaderIndex(

      headers,

      [

        "planned working hours",

        "working hours",

        "planned hours",

      ]

    );



  if (

    riderIndex < 0 ||

    dateIndex < 0 ||

    hoursIndex < 0

  ) {

    throw new Error(

      "CSV columns not found: Rider Id, Created Date, Planned Working Hours"

    );

  }



  const result:

    ShiftRecord[] = [];



  for (

    let index = 1;

    index <

    lines.length;

    index++

  ) {

    const values =

      splitCsvLine(

        lines[index]

      );



    const riderId =

      normalizeId(

        values[

          riderIndex

        ]

      );



    const date =

      parseReportDate(

        values[

          dateIndex

        ]

      );



    const hours =

      parseHours(

        values[

          hoursIndex

        ]

      );



    if (

      !riderId ||

      !date ||

      hours === null

    ) {

      continue;

    }



    result.push({

      riderId,

      date,

      hours,

    });

  }



  return result;

}



/* =========================================================

   AGGREGATE

========================================================= */



function aggregateRecords(

  records: ShiftRecord[]

): ShiftRecord[] {

  const map =

    new Map<

      string,

      ShiftRecord

    >();



  records.forEach(

    (record) => {

      const key =

        `${record.riderId}__${record.date}`;



      const existing =

        map.get(key);



      if (existing) {

        existing.hours +=

          record.hours;



        return;

      }



      map.set(

        key,

        {

          ...record,

        }

      );

    }

  );



  return Array.from(

    map.values()

  ).sort(

    (a, b) => {

      if (

        a.riderId !==

        b.riderId

      ) {

        return Number(

          a.riderId

        ) -

          Number(

            b.riderId

          );

      }



      return a.date.localeCompare(

        b.date

      );

    }

  );

}



/* =========================================================

   CSV LINE

========================================================= */



function splitCsvLine(

  line: string

): string[] {

  const values:

    string[] = [];



  let current = "";



  let insideQuotes =

    false;



  for (

    let index = 0;

    index <

    line.length;

    index++

  ) {

    const char =

      line[index];



    if (char === '"') {

      if (

        insideQuotes &&

        line[index + 1] ===

          '"'

      ) {

        current += '"';

        index++;

      } else {

        insideQuotes =

          !insideQuotes;

      }



      continue;

    }



    if (

      char === "," &&

      !insideQuotes

    ) {

      values.push(

        current.trim()

      );



      current = "";



      continue;

    }



    current += char;

  }



  values.push(

    current.trim()

  );



  return values;

}



/* =========================================================

   HEADER

========================================================= */



function normalizeHeader(

  value: string

) {

  return value

    .replace(/^"|"$/g, "")

    .trim()

    .toLowerCase()

    .replace(/\s+/g, " ");

}



function findHeaderIndex(

  headers: string[],

  candidates: string[]

) {

  return headers.findIndex(

    (header) =>

      candidates.includes(

        header

      )

  );

}



/* =========================================================

   RIDER ID

========================================================= */



function normalizeId(

  value:

    | string

    | number

    | null

    | undefined

) {

  if (

    value === null ||

    value === undefined

  ) {

    return "";

  }



  const cleaned =

    String(value)

      .trim()

      .replace(/^"|"$/g, "");



  if (

    cleaned.endsWith(

      ".0"

    )

  ) {

    return cleaned.slice(

      0,

      -2

    );

  }



  return cleaned;

}



/* =========================================================

   REPORT DATE

========================================================= */



function parseReportDate(

  value:

    | string

    | undefined

) {

  if (!value) {

    return "";

  }



  const text =

    value

      .trim()

      .replace(/^"|"$/g, "");



  /*

    مثال الملف:

    Sep 16, 2026

  */



  const match =

    text.match(

      /^([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})$/

    );



  if (match) {

    const monthMap:

      Record<

        string,

        number

      > = {

      jan: 1,

      january: 1,



      feb: 2,

      february: 2,



      mar: 3,

      march: 3,



      apr: 4,

      april: 4,



      may: 5,



      jun: 6,

      june: 6,



      jul: 7,

      july: 7,



      aug: 8,

      august: 8,



      sep: 9,

      sept: 9,

      september: 9,



      oct: 10,

      october: 10,



      nov: 11,

      november: 11,



      dec: 12,

      december: 12,

    };



    const month =

      monthMap[

        match[1].toLowerCase()

      ];



    if (!month) {

      return "";

    }



    return `${match[3]}-${String(

      month

    ).padStart(

      2,

      "0"

    )}-${String(

      Number(match[2])

    ).padStart(

      2,

      "0"

    )}`;

  }



  /*

    دعم YYYY-MM-DD

  */



  const iso =

    text.match(

      /^(\d{4})-(\d{1,2})-(\d{1,2})$/

    );



  if (iso) {

    return `${iso[1]}-${iso[2].padStart(

      2,

      "0"

    )}-${iso[3].padStart(

      2,

      "0"

    )}`;

  }



  return "";

}



/* =========================================================

   HOURS

========================================================= */



function parseHours(

  value:

    | string

    | undefined

): number | null {

  if (

    value === undefined

  ) {

    return null;

  }



  const cleaned =

    value

      .trim()

      .replace(/^"|"$/g, "");



  if (!cleaned) {

    return null;

  }



  const number =

    Number(cleaned);



  if (

    !Number.isFinite(

      number

    )

  ) {

    return null;

  }



  return Math.max(

    0,

    number

  );

}



/* =========================================================

   FORMAT HOURS

========================================================= */



function formatHours(

  value: number,

  isAr: boolean

) {

  const totalMinutes =

    Math.round(

      value * 60

    );



  const hours =

    Math.floor(

      totalMinutes / 60

    );



  const minutes =

    totalMinutes % 60;



  if (

    minutes === 0

  ) {

    return isAr

      ? `${hours} س`

      : `${hours}h`;

  }



  if (

    hours === 0

  ) {

    return isAr

      ? `${minutes} د`

      : `${minutes}m`;

  }



  return isAr

    ? `${hours}س ${minutes}د`

    : `${hours}h ${minutes}m`;

}



/* =========================================================

   SAUDI TODAY

========================================================= */



function getSaudiDateKey() {

  const formatter =

    new Intl.DateTimeFormat(

      "en-CA",

      {

        timeZone:

          "Asia/Riyadh",



        year: "numeric",

        month: "2-digit",

        day: "2-digit",

      }

    );



  const parts =

    formatter.formatToParts(

      new Date()

    );



  const year =

    parts.find(

      (part) =>

        part.type ===

        "year"

    )?.value;



  const month =

    parts.find(

      (part) =>

        part.type ===

        "month"

    )?.value;



  const day =

    parts.find(

      (part) =>

        part.type ===

        "day"

    )?.value;



  return `${year}-${month}-${day}`;

}



/* =========================================================

   DATE HELPERS

========================================================= */



function dateKeyToDate(

  key: string

) {

  const [

    year,

    month,

    day,

  ] = key

    .split("-")

    .map(Number);



  return new Date(

    year,

    month - 1,

    day,

    12,

    0,

    0

  );

}



function dateToKey(

  date: Date

) {

  return `${date.getFullYear()}-${String(

    date.getMonth() + 1

  ).padStart(

    2,

    "0"

  )}-${String(

    date.getDate()

  ).padStart(

    2,

    "0"

  )}`;

}



function addDaysToDateKey(

  key: string,

  days: number

) {

  const date =

    dateKeyToDate(

      key

    );



  date.setDate(

    date.getDate() +

      days

  );



  return dateToKey(

    date

  );

}



function createDateRange(

  from: string,

  to: string

) {

  if (

    !from ||

    !to

  ) {

    return [];

  }



  const result:

    string[] = [];



  const current =

    dateKeyToDate(

      from

    );



  const end =

    dateKeyToDate(

      to

    );



  while (

    current.getTime() <=

    end.getTime()

  ) {

    result.push(

      dateToKey(

        current

      )

    );



    current.setDate(

      current.getDate() +

        1

    );

  }



  return result;

}



/* =========================================================

   DATE FORMAT

========================================================= */



function getWeekdayName(

  key: string,

  isAr: boolean

) {

  return new Intl.DateTimeFormat(

    isAr

      ? "ar-SA"

      : "en-US",

    {

      weekday: "short",

    }

  ).format(

    dateKeyToDate(key)

  );

}



function formatDateShort(

  key:

    | string

    | undefined,

  isAr: boolean

) {

  if (!key) {

    return "—";

  }



  return new Intl.DateTimeFormat(

    isAr

      ? "ar-SA-u-ca-gregory"

      : "en-GB",

    {

      day: "2-digit",

      month: "2-digit",

    }

  ).format(

    dateKeyToDate(key)

  );

}



function formatDateHeader(

  key: string,

  isAr: boolean

) {

  return new Intl.DateTimeFormat(

    isAr

      ? "ar-SA-u-ca-gregory"

      : "en-GB",

    {

      weekday: "long",

      day: "numeric",

      month: "long",

    }

  ).format(

    dateKeyToDate(key)

  );

}



function formatDateTime(

  value: string,

  isAr: boolean

) {

  const date =

    new Date(value);



  if (

    Number.isNaN(

      date.getTime()

    )

  ) {

    return "—";

  }



  return new Intl.DateTimeFormat(

    isAr

      ? "ar-SA-u-ca-gregory"

      : "en-GB",

    {

      day: "2-digit",

      month: "2-digit",

      year: "numeric",

      hour: "2-digit",

      minute: "2-digit",

    }

  ).format(date);

}
