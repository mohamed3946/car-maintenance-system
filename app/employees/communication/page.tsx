"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import AppLayout, {
  useLanguage,
} from "../../../components/AppLayout";

import { supabase } from "../../lib/supabase";

import {
  AlertCircle,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  CircleDollarSign,
  Clock3,
  Filter,
  Flame,
  Languages,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Phone,
  Search,
  Send,
  ShieldAlert,
  Target,
  UserCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Lang = "ar" | "en";

type PlatformFilter =
  | "all"
  | "hunger"
  | "keeta"
  | "both";

type Category =
  | "all"
  | "performance"
  | "operations"
  | "zones"
  | "shifts"
  | "cash"
  | "compliance"
  | "attendance"
  | "general";

type Employee = {
  id: string;
  name: string;
  iqama: string | null;
  phone: string | null;
  job_title: string | null;
  work_location: string | null;
  status: string | null;

  platform_id: string | null;
  hunger_id: string | null;
  keeta_id: string | null;
};

type MessageTemplate = {
  id: string;
  category: Category;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  icon:
    | "performance"
    | "operations"
    | "zones"
    | "shifts"
    | "cash"
    | "compliance"
    | "attendance"
    | "general";
};

type SendLanguage =
  | "ar"
  | "en";

/* =========================================================
   MESSAGE TEMPLATES
========================================================= */

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  /* =======================================================
     PERFORMANCE
  ======================================================= */

  {
    id: "performance-orders-now",
    category: "performance",
    titleAr: "كم عدد الطلبات؟",
    titleEn: "How many orders?",
    messageAr:
      "مرحبًا {name}، كم عدد الطلبات التي أكملتها حتى الآن؟ يرجى الرد بعدد الطلبات الحالي.",
    messageEn:
      "Hello {name}, how many orders have you completed so far? Please reply with your current order count.",
    icon: "performance",
  },

  {
    id: "performance-low-orders",
    category: "performance",
    titleAr: "الطلبات أقل من المطلوب",
    titleEn: "Orders below target",
    messageAr:
      "مرحبًا {name}، عدد طلباتك حتى الآن أقل من المستوى المطلوب. يرجى زيادة النشاط والاستمرار في استقبال الطلبات.",
    messageEn:
      "Hello {name}, your order count is currently below the required level. Please increase your activity and continue accepting orders.",
    icon: "performance",
  },

  {
    id: "performance-zero-orders",
    category: "performance",
    titleAr: "لا توجد طلبات",
    titleEn: "No orders recorded",
    messageAr:
      "مرحبًا {name}، لم يتم تسجيل طلبات لك حتى الآن. يرجى التأكد من أنك متصل بالتطبيق ومتواجد في منطقة نشطة.",
    messageEn:
      "Hello {name}, no orders have been recorded for you so far. Please make sure you are online and located in an active area.",
    icon: "performance",
  },

  {
    id: "performance-good",
    category: "performance",
    titleAr: "أداء جيد",
    titleEn: "Good performance",
    messageAr:
      "أحسنت {name}، أداؤك اليوم جيد. استمر بنفس المستوى وحافظ على قبول الطلبات والالتزام بالتعليمات.",
    messageEn:
      "Good job {name}, your performance today is good. Keep the same level and continue accepting orders and following instructions.",
    icon: "performance",
  },

  {
    id: "performance-excellent",
    category: "performance",
    titleAr: "أداء ممتاز",
    titleEn: "Excellent performance",
    messageAr:
      "ممتاز يا {name}، أداؤك اليوم ممتاز. استمر بنفس المستوى حتى نهاية الشفت.",
    messageEn:
      "Excellent work {name}, your performance today is very good. Please maintain the same level until the end of your shift.",
    icon: "performance",
  },

  {
    id: "performance-increase-orders",
    category: "performance",
    titleAr: "زد عدد الطلبات",
    titleEn: "Increase your orders",
    messageAr:
      "مرحبًا {name}، نحتاج إلى زيادة عدد الطلبات خلال الساعات القادمة. يرجى عدم التوقف والاستمرار في العمل.",
    messageEn:
      "Hello {name}, we need you to increase your order count during the coming hours. Please remain active and continue working.",
    icon: "performance",
  },

  /* =======================================================
     OPERATIONS
  ======================================================= */

  {
    id: "operations-start-work",
    category: "operations",
    titleAr: "ابدأ العمل",
    titleEn: "Start working",
    messageAr:
      "مرحبًا {name}، يرجى بدء العمل الآن والتأكد من تشغيل التطبيق والاستعداد لاستقبال الطلبات.",
    messageEn:
      "Hello {name}, please start working now, make sure the app is online, and be ready to receive orders.",
    icon: "operations",
  },

  {
    id: "operations-stay-online",
    category: "operations",
    titleAr: "ابقَ متصلًا",
    titleEn: "Stay online",
    messageAr:
      "مرحبًا {name}، يرجى البقاء متصلًا بالتطبيق وعدم تسجيل الخروج أثناء وقت العمل.",
    messageEn:
      "Hello {name}, please stay online in the app and do not log out during working hours.",
    icon: "operations",
  },

  {
    id: "operations-no-stop",
    category: "operations",
    titleAr: "عدم التوقف",
    titleEn: "Do not stop working",
    messageAr:
      "مرحبًا {name}، يرجى عدم التوقف أثناء ساعات العمل والاستمرار في استقبال وتنفيذ الطلبات.",
    messageEn:
      "Hello {name}, please do not stop during working hours and continue receiving and completing orders.",
    icon: "operations",
  },

  {
    id: "operations-check-app",
    category: "operations",
    titleAr: "تحقق من التطبيق",
    titleEn: "Check your app",
    messageAr:
      "مرحبًا {name}، يرجى التأكد من أن تطبيق التوصيل يعمل بشكل صحيح وأن حالة الحساب Online.",
    messageEn:
      "Hello {name}, please make sure the delivery app is working correctly and your account status is Online.",
    icon: "operations",
  },

  {
    id: "operations-contact-supervisor",
    category: "operations",
    titleAr: "تواصل مع المشرف",
    titleEn: "Contact your supervisor",
    messageAr:
      "مرحبًا {name}، يرجى التواصل مع المشرف فورًا لمراجعة وضع التشغيل الخاص بك.",
    messageEn:
      "Hello {name}, please contact your supervisor immediately to review your current operational status.",
    icon: "operations",
  },

  /* =======================================================
     HOT ZONES
  ======================================================= */

  {
    id: "zones-go-restaurants",
    category: "zones",
    titleAr: "اذهب إلى مناطق المطاعم",
    titleEn: "Go to restaurant areas",
    messageAr:
      "مرحبًا {name}، يرجى التوجه إلى منطقة تحتوي على كثافة عالية من المطاعم لزيادة فرص استقبال الطلبات.",
    messageEn:
      "Hello {name}, please move to an area with a high concentration of restaurants to increase your chances of receiving orders.",
    icon: "zones",
  },

  {
    id: "zones-change-area",
    category: "zones",
    titleAr: "غيّر المنطقة الحالية",
    titleEn: "Change your current area",
    messageAr:
      "مرحبًا {name}، المنطقة الحالية لا تبدو مناسبة للتشغيل. يرجى الانتقال إلى منطقة أخرى أكثر نشاطًا.",
    messageEn:
      "Hello {name}, your current area does not appear suitable for operations. Please move to a more active area.",
    icon: "zones",
  },

  {
    id: "zones-north",
    category: "zones",
    titleAr: "توجه إلى المنطقة الشمالية",
    titleEn: "Move to the northern area",
    messageAr:
      "مرحبًا {name}، يرجى التوجه إلى المنطقة الشمالية والعمل بالقرب من تجمعات المطاعم.",
    messageEn:
      "Hello {name}, please move to the northern area and work near restaurant clusters.",
    icon: "zones",
  },

  {
    id: "zones-central",
    category: "zones",
    titleAr: "توجه إلى المنطقة المركزية",
    titleEn: "Move to the central area",
    messageAr:
      "مرحبًا {name}، يرجى التوجه إلى المنطقة المركزية والتمركز بالقرب من مناطق المطاعم.",
    messageEn:
      "Hello {name}, please move to the central area and stay close to restaurant zones.",
    icon: "zones",
  },

  {
    id: "zones-dont-stay-empty-area",
    category: "zones",
    titleAr: "لا تبقَ في منطقة ضعيفة",
    titleEn: "Do not stay in a low-activity area",
    messageAr:
      "مرحبًا {name}، لا تبقَ في منطقة لا توجد بها طلبات. يرجى التحرك إلى منطقة مطاعم أكثر نشاطًا.",
    messageEn:
      "Hello {name}, do not remain in an area with no orders. Please move to a more active restaurant area.",
    icon: "zones",
  },

  /* =======================================================
     SHIFTS
  ======================================================= */

  {
    id: "shift-start",
    category: "shifts",
    titleAr: "ابدأ الشفت",
    titleEn: "Start your shift",
    messageAr:
      "مرحبًا {name}، حان وقت بدء الشفت. يرجى تسجيل الدخول والبدء في العمل الآن.",
    messageEn:
      "Hello {name}, it is time to start your shift. Please log in and begin working now.",
    icon: "shifts",
  },

  {
    id: "shift-before-start",
    category: "shifts",
    titleAr: "استعد للشفت",
    titleEn: "Prepare for your shift",
    messageAr:
      "مرحبًا {name}، شفتك سيبدأ قريبًا. يرجى الاستعداد والتواجد في منطقة العمل قبل بداية الشفت.",
    messageEn:
      "Hello {name}, your shift will start soon. Please be ready and arrive in your work area before the shift starts.",
    icon: "shifts",
  },

  {
    id: "shift-dont-leave",
    category: "shifts",
    titleAr: "لا تغادر الشفت",
    titleEn: "Do not leave your shift",
    messageAr:
      "مرحبًا {name}، يرجى عدم مغادرة الشفت أو تسجيل الخروج قبل انتهاء وقت العمل.",
    messageEn:
      "Hello {name}, please do not leave your shift or log out before the scheduled working time ends.",
    icon: "shifts",
  },

  {
    id: "shift-complete-hours",
    category: "shifts",
    titleAr: "أكمل ساعات العمل",
    titleEn: "Complete your working hours",
    messageAr:
      "مرحبًا {name}، يرجى الالتزام بإكمال ساعات العمل المطلوبة كاملة.",
    messageEn:
      "Hello {name}, please make sure to complete all required working hours.",
    icon: "shifts",
  },

  /* =======================================================
     CASH
  ======================================================= */

  {
    id: "cash-deposit",
    category: "cash",
    titleAr: "إيداع الكاش",
    titleEn: "Deposit your cash",
    messageAr:
      "مرحبًا {name}، يرجى إيداع الكاش المستحق في أسرع وقت وإرسال ما يثبت الإيداع.",
    messageEn:
      "Hello {name}, please deposit the outstanding cash as soon as possible and send proof of deposit.",
    icon: "cash",
  },

  {
    id: "cash-wallet-negative",
    category: "cash",
    titleAr: "المحفظة سالبة",
    titleEn: "Negative wallet balance",
    messageAr:
      "مرحبًا {name}، رصيد المحفظة لديك بالسالب. يرجى الإيداع فورًا حتى لا يتأثر استقبال الطلبات.",
    messageEn:
      "Hello {name}, your wallet balance is negative. Please deposit immediately to avoid affecting your order flow.",
    icon: "cash",
  },

  {
    id: "cash-settlement",
    category: "cash",
    titleAr: "تسوية الكاش",
    titleEn: "Cash settlement",
    messageAr:
      "مرحبًا {name}، لديك مبلغ يحتاج إلى تسوية مع المؤسسة. يرجى التواصل معنا وإنهاء التسوية اليوم.",
    messageEn:
      "Hello {name}, you have an outstanding amount that needs to be settled with the company. Please contact us and complete the settlement today.",
    icon: "cash",
  },

  {
    id: "cash-send-receipt",
    category: "cash",
    titleAr: "أرسل إيصال الإيداع",
    titleEn: "Send deposit receipt",
    messageAr:
      "مرحبًا {name}، بعد الإيداع يرجى إرسال صورة إيصال التحويل أو الإيداع للتأكيد.",
    messageEn:
      "Hello {name}, after depositing, please send a photo of the transfer or deposit receipt for confirmation.",
    icon: "cash",
  },

  /* =======================================================
     COMPLIANCE
  ======================================================= */

  {
    id: "compliance-follow-instructions",
    category: "compliance",
    titleAr: "التزم بالتعليمات",
    titleEn: "Follow instructions",
    messageAr:
      "مرحبًا {name}، يرجى الالتزام بجميع تعليمات التشغيل الصادرة من الإدارة والمشرفين.",
    messageEn:
      "Hello {name}, please follow all operational instructions issued by management and supervisors.",
    icon: "compliance",
  },

  {
    id: "compliance-no-reject",
    category: "compliance",
    titleAr: "لا ترفض الطلبات",
    titleEn: "Do not reject orders",
    messageAr:
      "مرحبًا {name}، يرجى عدم رفض الطلبات أو تجاهلها إلا في الحالات المسموح بها.",
    messageEn:
      "Hello {name}, please do not reject or ignore orders except in approved situations.",
    icon: "compliance",
  },

  {
    id: "compliance-uniform",
    category: "compliance",
    titleAr: "الالتزام بالزي",
    titleEn: "Wear the required uniform",
    messageAr:
      "مرحبًا {name}، يرجى الالتزام بالزي الرسمي ومتطلبات المظهر أثناء العمل.",
    messageEn:
      "Hello {name}, please wear the required uniform and comply with appearance requirements while working.",
    icon: "compliance",
  },

  {
    id: "compliance-face-verification",
    category: "compliance",
    titleAr: "التحقق بالوجه",
    titleEn: "Face verification",
    messageAr:
      "مرحبًا {name}، يرجى التأكد من إتمام التحقق بالوجه وعدم تجاهل أي طلب تحقق يظهر في التطبيق.",
    messageEn:
      "Hello {name}, please complete all face verification requests and do not ignore any verification prompts in the app.",
    icon: "compliance",
  },

  {
    id: "compliance-zone",
    category: "compliance",
    titleAr: "الالتزام بالمنطقة",
    titleEn: "Stay in your assigned area",
    messageAr:
      "مرحبًا {name}، يرجى الالتزام بمنطقة العمل المحددة وعدم الانتقال إلى مناطق أخرى بدون توجيه من المشرف.",
    messageEn:
      "Hello {name}, please remain in your assigned work area and do not move to other areas without supervisor instructions.",
    icon: "compliance",
  },

  {
    id: "compliance-on-time",
    category: "compliance",
    titleAr: "التسليم في الوقت",
    titleEn: "Deliver on time",
    messageAr:
      "مرحبًا {name}، يرجى الالتزام بسرعة استلام وتسليم الطلبات وتجنب التأخير.",
    messageEn:
      "Hello {name}, please make sure orders are picked up and delivered on time and avoid unnecessary delays.",
    icon: "compliance",
  },

  /* =======================================================
     ATTENDANCE
  ======================================================= */

  {
    id: "attendance-where",
    category: "attendance",
    titleAr: "أين أنت الآن؟",
    titleEn: "Where are you now?",
    messageAr:
      "مرحبًا {name}، يرجى إفادتنا بموقعك الحالي وحالة العمل الآن.",
    messageEn:
      "Hello {name}, please let us know your current location and work status.",
    icon: "attendance",
  },

  {
    id: "attendance-absent",
    category: "attendance",
    titleAr: "غياب عن العمل",
    titleEn: "Absent from work",
    messageAr:
      "مرحبًا {name}، لم تبدأ العمل في الوقت المحدد. يرجى توضيح سبب الغياب والتواصل مع المشرف فورًا.",
    messageEn:
      "Hello {name}, you did not start work at the scheduled time. Please explain the reason for your absence and contact your supervisor immediately.",
    icon: "attendance",
  },

  {
    id: "attendance-return",
    category: "attendance",
    titleAr: "العودة للعمل",
    titleEn: "Return to work",
    messageAr:
      "مرحبًا {name}، يرجى العودة للعمل واستكمال الشفت في أسرع وقت.",
    messageEn:
      "Hello {name}, please return to work and continue your shift as soon as possible.",
    icon: "attendance",
  },

  {
    id: "attendance-no-response",
    category: "attendance",
    titleAr: "عدم الرد",
    titleEn: "No response",
    messageAr:
      "مرحبًا {name}، حاولنا التواصل معك ولم نتلقَ ردًا. يرجى التواصل مع الإدارة فور استلام الرسالة.",
    messageEn:
      "Hello {name}, we tried to contact you but did not receive a response. Please contact management immediately after receiving this message.",
    icon: "attendance",
  },

  /* =======================================================
     GENERAL
  ======================================================= */

  {
    id: "general-contact-us",
    category: "general",
    titleAr: "تواصل معنا",
    titleEn: "Contact us",
    messageAr:
      "مرحبًا {name}، يرجى التواصل مع الإدارة عند استلام هذه الرسالة.",
    messageEn:
      "Hello {name}, please contact management when you receive this message.",
    icon: "general",
  },

  {
    id: "general-important",
    category: "general",
    titleAr: "تنبيه مهم",
    titleEn: "Important notice",
    messageAr:
      "مرحبًا {name}، يوجد تنبيه مهم بخصوص العمل. يرجى مراجعة الرسالة والتواصل مع المشرف إذا كان لديك أي استفسار.",
    messageEn:
      "Hello {name}, there is an important notice regarding work. Please review the message and contact your supervisor if you have any questions.",
    icon: "general",
  },

  {
    id: "general-thank-you",
    category: "general",
    titleAr: "شكر وتقدير",
    titleEn: "Thank you",
    messageAr:
      "شكرًا لك {name} على تعاونك والتزامك بالتعليمات. نتمنى لك يوم عمل موفق.",
    messageEn:
      "Thank you {name} for your cooperation and commitment to instructions. We wish you a successful working day.",
    icon: "general",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function CommunicationPage() {
  return (
    <AppLayout
      system="employees"
      title={
        "مركز التواصل"
      }
      subtitle={
        "التواصل المباشر مع المناديب وإرسال الرسائل التشغيلية الجاهزة"
      }
    >
      <CommunicationContent />
    </AppLayout>
  );
}

/* =========================================================
   CONTENT
========================================================= */

function CommunicationContent() {
  const { lang } =
    useLanguage();

  const isAr =
    lang === "ar";

  const [
    employees,
    setEmployees,
  ] = useState<
    Employee[]
  >([]);

  const [
    selectedEmployee,
    setSelectedEmployee,
  ] = useState<
    Employee | null
  >(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    platformFilter,
    setPlatformFilter,
  ] =
    useState<PlatformFilter>(
      "all"
    );

  const [
    category,
    setCategory,
  ] =
    useState<Category>(
      "all"
    );

  const [
    sendLanguage,
    setSendLanguage,
  ] =
    useState<SendLanguage>(
      "ar"
    );

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    selectedTemplateId,
    setSelectedTemplateId,
  ] =
    useState<
      string | null
    >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /* =========================================================
     LOAD EMPLOYEES
  ========================================================= */

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    setLoading(true);

    const {
      data,
      error,
    } = await supabase
      .from("employees")
      .select(`
        id,
        name,
        iqama,
        phone,
        job_title,
        work_location,
        status,
        platform_id,
        hunger_id,
        keeta_id
      `)
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error(
        "LOAD COMMUNICATION RIDERS ERROR:",
        error
      );

      setEmployees([]);
      setLoading(false);

      return;
    }

    const riders =
      (data || [])
        .filter(
          (employee: any) =>
            normalizeStatus(
              employee.status
            ) ===
              "active" &&
            isDeliveryCourier(
              employee.job_title
            )
        )
        .map(
          (employee: any) => ({
            ...employee,
            name:
              employee.name ||
              "-",
          })
        ) as Employee[];

    setEmployees(riders);

    if (
      riders.length > 0
    ) {
      setSelectedEmployee(
        riders[0]
      );
    }

    setLoading(false);
  }

  /* =========================================================
     FILTER EMPLOYEES
  ========================================================= */

  const filteredEmployees =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return employees.filter(
        (employee) => {
          const searchable = [
            employee.name,
            employee.iqama,
            employee.phone,
            employee.platform_id,
            employee.hunger_id,
            employee.keeta_id,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !query ||
            searchable.includes(
              query
            );

          const location =
            normalizeLocation(
              employee.work_location
            );

          const matchesPlatform =
            platformFilter ===
              "all" ||
            location ===
              platformFilter ||
            (platformFilter ===
              "hunger" &&
              location ===
                "both") ||
            (platformFilter ===
              "keeta" &&
              location ===
                "both");

          return (
            matchesSearch &&
            matchesPlatform
          );
        }
      );
    }, [
      employees,
      search,
      platformFilter,
    ]);

  /* =========================================================
     FILTER TEMPLATES
  ========================================================= */

  const filteredTemplates =
    useMemo(() => {
      if (
        category === "all"
      ) {
        return MESSAGE_TEMPLATES;
      }

      return MESSAGE_TEMPLATES.filter(
        (template) =>
          template.category ===
          category
      );
    }, [category]);

  /* =========================================================
     TEMPLATE CLICK
  ========================================================= */

  function selectTemplate(
    template: MessageTemplate
  ) {
    setSelectedTemplateId(
      template.id
    );

    const text =
      sendLanguage === "ar"
        ? template.messageAr
        : template.messageEn;

    setMessage(
      replaceVariables(
        text,
        selectedEmployee
      )
    );
  }

  /* =========================================================
     CHANGE LANGUAGE
  ========================================================= */

  function changeSendLanguage(
    nextLanguage: SendLanguage
  ) {
    setSendLanguage(
      nextLanguage
    );

    if (
      !selectedTemplateId
    ) {
      return;
    }

    const template =
      MESSAGE_TEMPLATES.find(
        (item) =>
          item.id ===
          selectedTemplateId
      );

    if (!template) {
      return;
    }

    const text =
      nextLanguage === "ar"
        ? template.messageAr
        : template.messageEn;

    setMessage(
      replaceVariables(
        text,
        selectedEmployee
      )
    );
  }

  /* =========================================================
     CHANGE RIDER
  ========================================================= */

  function chooseEmployee(
    employee: Employee
  ) {
    setSelectedEmployee(
      employee
    );

    if (
      selectedTemplateId
    ) {
      const template =
        MESSAGE_TEMPLATES.find(
          (item) =>
            item.id ===
            selectedTemplateId
        );

      if (template) {
        const text =
          sendLanguage ===
          "ar"
            ? template.messageAr
            : template.messageEn;

        setMessage(
          replaceVariables(
            text,
            employee
          )
        );
      }
    }
  }

  /* =========================================================
     SEND INTERNAL MESSAGE
  ========================================================= */

  async function sendInternalMessage() {
    if (
      !selectedEmployee ||
      !message.trim()
    ) {
      return;
    }

    setSending(true);
    setSuccessMessage("");

    const {
      error,
    } = await supabase
      .from(
        "rider_chat_messages"
      )
      .insert({
        employee_id:
          selectedEmployee.id,

        sender_type:
          "admin",

        message:
          message.trim(),

        is_read:
          false,
      });

    if (error) {
      console.error(
        "SEND MESSAGE ERROR:",
        error
      );

      alert(
        isAr
          ? "تعذر إرسال الرسالة. تأكد من إنشاء جدول rider_chat_messages."
          : "Could not send message. Make sure rider_chat_messages table exists."
      );

      setSending(false);

      return;
    }

    setSuccessMessage(
      isAr
        ? `تم إرسال الرسالة إلى ${selectedEmployee.name}`
        : `Message sent to ${selectedEmployee.name}`
    );

    setSending(false);
  }

  /* =========================================================
     WHATSAPP
  ========================================================= */

  function openWhatsApp() {
    if (
      !selectedEmployee
    ) {
      return;
    }

    if (
      !selectedEmployee.phone
    ) {
      alert(
        isAr
          ? "رقم جوال المندوب غير مسجل."
          : "Rider phone number is not available."
      );

      return;
    }

    if (!message.trim()) {
      return;
    }

    const phone =
      normalizeSaudiPhone(
        selectedEmployee.phone
      );

    const encoded =
      encodeURIComponent(
        message.trim()
      );

    window.open(
      `https://wa.me/${phone}?text=${encoded}`,
      "_blank"
    );
  }

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories: {
    key: Category;
    ar: string;
    en: string;
  }[] = [
    {
      key: "all",
      ar: "الكل",
      en: "All",
    },
    {
      key: "performance",
      ar: "الأداء",
      en: "Performance",
    },
    {
      key: "operations",
      ar: "التشغيل",
      en: "Operations",
    },
    {
      key: "zones",
      ar: "المناطق",
      en: "Zones",
    },
    {
      key: "shifts",
      ar: "الشفتات",
      en: "Shifts",
    },
    {
      key: "cash",
      ar: "الكاش",
      en: "Cash",
    },
    {
      key: "compliance",
      ar: "الالتزام",
      en: "Compliance",
    },
    {
      key: "attendance",
      ar: "الحضور",
      en: "Attendance",
    },
    {
      key: "general",
      ar: "عام",
      en: "General",
    },
  ];

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />

          <span className="text-sm font-black text-slate-600">
            {isAr
              ? "جاري تحميل المناديب..."
              : "Loading riders..."}
          </span>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
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
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-l from-[#092e55] via-[#0c3a69] to-[#10538d] p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -top-20 end-0 h-64 w-64 rounded-full bg-blue-300/10" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <MessageCircle className="h-6 w-6 text-cyan-300" />
            </div>

            <div>
              <h1 className="text-2xl font-black md:text-3xl">
                {isAr
                  ? "مركز التواصل مع المناديب"
                  : "Rider Communication Center"}
              </h1>

              <p className="mt-1 text-sm font-semibold text-blue-100">
                {isAr
                  ? "إرسال تعليمات التشغيل والتنبيهات والرسائل الجاهزة مباشرة إلى المناديب."
                  : "Send operational instructions, alerts and saved messages directly to riders."}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <HeroBadge
              icon={
                <Users className="h-4 w-4" />
              }
              value={
                employees.length
              }
              label={
                isAr
                  ? "مندوب نشط"
                  : "Active Riders"
              }
            />

            <HeroBadge
              icon={
                <MessageSquareText className="h-4 w-4" />
              }
              value={
                MESSAGE_TEMPLATES.length
              }
              label={
                isAr
                  ? "رسالة جاهزة"
                  : "Saved Templates"
              }
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <section className="grid gap-4 2xl:grid-cols-[330px_minmax(0,1fr)_430px]">
        {/* ===================================================
            RIDERS
        =================================================== */}

        <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-[#102a4c]">
                  {isAr
                    ? "المناديب"
                    : "Riders"}
                </h2>

                <p className="mt-1 text-[11px] font-bold text-slate-400">
                  {
                    filteredEmployees.length
                  }{" "}
                  {isAr
                    ? "مندوب"
                    : "riders"}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users className="h-4 w-4" />
              </div>
            </div>

            {/* SEARCH */}

            <div className="relative mt-4">
              <Search
                className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${
                  isAr
                    ? "right-3"
                    : "left-3"
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
                    ? "بحث عن مندوب..."
                    : "Search rider..."
                }
                className={`h-10 w-full rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold outline-none focus:border-blue-300 focus:bg-white ${
                  isAr
                    ? "pr-9 pl-3"
                    : "pl-9 pr-3"
                }`}
              />
            </div>

            {/* PLATFORM */}

            <div className="mt-3 grid grid-cols-2 gap-2">
              <PlatformButton
                active={
                  platformFilter ===
                  "all"
                }
                label={
                  isAr
                    ? "الكل"
                    : "All"
                }
                onClick={() =>
                  setPlatformFilter(
                    "all"
                  )
                }
              />

              <PlatformButton
                active={
                  platformFilter ===
                  "hunger"
                }
                label="HungerStation"
                onClick={() =>
                  setPlatformFilter(
                    "hunger"
                  )
                }
              />

              <PlatformButton
                active={
                  platformFilter ===
                  "keeta"
                }
                label="Keeta"
                onClick={() =>
                  setPlatformFilter(
                    "keeta"
                  )
                }
              />

              <PlatformButton
                active={
                  platformFilter ===
                  "both"
                }
                label={
                  isAr
                    ? "الاثنين"
                    : "Both"
                }
                onClick={() =>
                  setPlatformFilter(
                    "both"
                  )
                }
              />
            </div>
          </div>

          <div className="max-h-[650px] overflow-y-auto p-2">
            {filteredEmployees.map(
              (employee) => {
                const selected =
                  selectedEmployee?.id ===
                  employee.id;

                return (
                  <button
                    key={
                      employee.id
                    }
                    type="button"
                    onClick={() =>
                      chooseEmployee(
                        employee
                      )
                    }
                    className={`mb-1.5 flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition ${
                      selected
                        ? "border-blue-200 bg-blue-50"
                        : "border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                        selected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {getInitials(
                        employee.name
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-[#102a4c]">
                        {
                          employee.name
                        }
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        {hasHunger(
                          employee.work_location
                        ) && (
                          <span className="rounded-md bg-green-50 px-1.5 py-0.5 text-[8px] font-black text-green-700">
                            HS
                          </span>
                        )}

                        {hasKeeta(
                          employee.work_location
                        ) && (
                          <span className="rounded-md bg-violet-50 px-1.5 py-0.5 text-[8px] font-black text-violet-700">
                            KEETA
                          </span>
                        )}

                        <span className="text-[9px] font-bold text-slate-400">
                          {
                            employee.iqama
                          }
                        </span>
                      </div>
                    </div>

                    {selected && (
                      <Check className="h-4 w-4 shrink-0 text-blue-600" />
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* ===================================================
            MESSAGE COMPOSER
        =================================================== */}

        <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
          {selectedEmployee ? (
            <>
              {/* RIDER HEADER */}

              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102a4c] text-sm font-black text-white">
                    {getInitials(
                      selectedEmployee.name
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-[#102a4c]">
                      {
                        selectedEmployee.name
                      }
                    </h2>

                    <div
                      dir="ltr"
                      className="mt-1 flex items-center gap-2 text-[10px] font-bold text-slate-400"
                    >
                      <span>
                        {
                          selectedEmployee.phone ||
                          "-"
                        }
                      </span>

                      <span>
                        •
                      </span>

                      <span>
                        {
                          selectedEmployee.iqama ||
                          "-"
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/employees/${selectedEmployee.id}`}
                  className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-100"
                >
                  {isAr
                    ? "التفاصيل"
                    : "Details"}
                </Link>
              </div>

              {/* LANGUAGE */}

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-[#102a4c]">
                    {isAr
                      ? "لغة الرسالة"
                      : "Message Language"}
                  </p>

                  <p className="mt-1 text-[10px] font-bold text-slate-400">
                    {isAr
                      ? "اختر اللغة قبل اختيار الرسالة"
                      : "Choose language before selecting a template"}
                  </p>
                </div>

                <div className="flex rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() =>
                      changeSendLanguage(
                        "ar"
                      )
                    }
                    className={`rounded-lg px-4 py-2 text-xs font-black transition ${
                      sendLanguage ===
                      "ar"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    AR
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      changeSendLanguage(
                        "en"
                      )
                    }
                    className={`rounded-lg px-4 py-2 text-xs font-black transition ${
                      sendLanguage ===
                      "en"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {/* MESSAGE */}

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-black text-[#102a4c]">
                    {isAr
                      ? "الرسالة"
                      : "Message"}
                  </p>

                  <span className="text-[10px] font-bold text-slate-400">
                    {
                      message.length
                    }{" "}
                    {isAr
                      ? "حرف"
                      : "characters"}
                  </span>
                </div>

                <textarea
                  dir={
                    sendLanguage ===
                    "ar"
                      ? "rtl"
                      : "ltr"
                  }
                  value={message}
                  onChange={(
                    event
                  ) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  placeholder={
                    isAr
                      ? "اختر رسالة جاهزة أو اكتب رسالة مخصصة..."
                      : "Select a saved message or write a custom message..."
                  }
                  className="min-h-[260px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-7 text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {successMessage && (
                <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs font-black text-emerald-700">
                  {
                    successMessage
                  }
                </div>
              )}

              {/* ACTIONS */}

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={
                    sendInternalMessage
                  }
                  disabled={
                    sending ||
                    !message.trim()
                  }
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}

                  {isAr
                    ? "إرسال داخل التطبيق"
                    : "Send In App"}
                </button>

                <button
                  type="button"
                  onClick={
                    openWhatsApp
                  }
                  disabled={
                    !message.trim()
                  }
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-black text-white transition hover:bg-[#20bd5a] disabled:opacity-50"
                >
                  <MessageCircle className="h-5 w-5" />

                  WhatsApp
                </button>
              </div>
            </>
          ) : (
            <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
              <Users className="h-10 w-10 text-slate-300" />

              <p className="mt-4 font-black text-slate-500">
                {isAr
                  ? "اختر مندوبًا لبدء التواصل"
                  : "Select a rider to start communicating"}
              </p>
            </div>
          )}
        </div>

        {/* ===================================================
            TEMPLATES
        =================================================== */}

        <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-[#102a4c]">
                  {isAr
                    ? "الرسائل الجاهزة"
                    : "Saved Messages"}
                </h2>

                <p className="mt-1 text-[11px] font-bold text-slate-400">
                  {
                    MESSAGE_TEMPLATES.length
                  }{" "}
                  {isAr
                    ? "رسالة تشغيلية"
                    : "operational templates"}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <MessageSquareText className="h-4 w-4" />
              </div>
            </div>

            {/* CATEGORIES */}

            <div className="mt-4 flex flex-wrap gap-1.5">
              {categories.map(
                (item) => (
                  <button
                    key={
                      item.key
                    }
                    type="button"
                    onClick={() =>
                      setCategory(
                        item.key
                      )
                    }
                    className={`rounded-xl px-3 py-2 text-[10px] font-black transition ${
                      category ===
                      item.key
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {isAr
                      ? item.ar
                      : item.en}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="max-h-[650px] space-y-2 overflow-y-auto p-3">
            {filteredTemplates.map(
              (template) => {
                const selected =
                  selectedTemplateId ===
                  template.id;

                return (
                  <button
                    key={
                      template.id
                    }
                    type="button"
                    onClick={() =>
                      selectTemplate(
                        template
                      )
                    }
                    className={`w-full rounded-2xl border p-3 text-start transition ${
                      selected
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <TemplateIcon
                        type={
                          template.icon
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-[#102a4c]">
                          {sendLanguage ===
                          "ar"
                            ? template.titleAr
                            : template.titleEn}
                        </p>

                        <p
                          dir={
                            sendLanguage ===
                            "ar"
                              ? "rtl"
                              : "ltr"
                          }
                          className="mt-1 line-clamp-2 text-[10px] font-semibold leading-5 text-slate-500"
                        >
                          {sendLanguage ===
                          "ar"
                            ? template.messageAr
                            : template.messageEn}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   HERO BADGE
========================================================= */

function HeroBadge({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm">
      {icon}

      <span className="text-sm font-black">
        {value}
      </span>

      <span className="text-[10px] font-bold text-blue-100">
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   PLATFORM BUTTON
========================================================= */

function PlatformButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-xl text-[10px] font-black transition ${
        active
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

/* =========================================================
   TEMPLATE ICON
========================================================= */

function TemplateIcon({
  type,
}: {
  type: MessageTemplate["icon"];
}) {
  const common =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl";

  if (
    type === "performance"
  ) {
    return (
      <div
        className={`${common} bg-blue-50 text-blue-600`}
      >
        <Target className="h-4 w-4" />
      </div>
    );
  }

  if (
    type === "operations"
  ) {
    return (
      <div
        className={`${common} bg-cyan-50 text-cyan-600`}
      >
        <BriefcaseBusiness className="h-4 w-4" />
      </div>
    );
  }

  if (
    type === "zones"
  ) {
    return (
      <div
        className={`${common} bg-orange-50 text-orange-600`}
      >
        <MapPin className="h-4 w-4" />
      </div>
    );
  }

  if (
    type === "shifts"
  ) {
    return (
      <div
        className={`${common} bg-violet-50 text-violet-600`}
      >
        <CalendarClock className="h-4 w-4" />
      </div>
    );
  }

  if (
    type === "cash"
  ) {
    return (
      <div
        className={`${common} bg-emerald-50 text-emerald-600`}
      >
        <Wallet className="h-4 w-4" />
      </div>
    );
  }

  if (
    type === "compliance"
  ) {
    return (
      <div
        className={`${common} bg-red-50 text-red-600`}
      >
        <ShieldAlert className="h-4 w-4" />
      </div>
    );
  }

  if (
    type === "attendance"
  ) {
    return (
      <div
        className={`${common} bg-amber-50 text-amber-600`}
      >
        <Clock3 className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div
      className={`${common} bg-slate-100 text-slate-600`}
    >
      <Bell className="h-4 w-4" />
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function replaceVariables(
  message: string,
  employee: Employee | null
) {
  if (!employee) {
    return message;
  }

  return message
    .replaceAll(
      "{name}",
      employee.name ||
        "-"
    )
    .replaceAll(
      "{iqama}",
      employee.iqama ||
        "-"
    )
    .replaceAll(
      "{phone}",
      employee.phone ||
        "-"
    )
    .replaceAll(
      "{hunger_id}",
      employee.hunger_id ||
        employee.platform_id ||
        "-"
    )
    .replaceAll(
      "{keeta_id}",
      employee.keeta_id ||
        employee.platform_id ||
        "-"
    );
}

function normalizeStatus(
  value: string | null
) {
  const status =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    [
      "active",
      "نشط",
    ].includes(status)
  ) {
    return "active";
  }

  if (
    [
      "stopped",
      "متوقف",
      "موقوف",
      "غير نشط",
    ].includes(status)
  ) {
    return "stopped";
  }

  if (
    [
      "vacation",
      "إجازة",
      "اجازة",
    ].includes(status)
  ) {
    return "vacation";
  }

  if (
    [
      "outofservice",
      "out_of_service",
      "out of service",
      "خارج الخدمة",
    ].includes(status)
  ) {
    return "outOfService";
  }

  return status;
}

function isDeliveryCourier(
  value: string | null
) {
  const job =
    String(value || "")
      .trim()
      .toLowerCase();

  return [
    "deliverycourier",
    "keetacourier",
    "hungercourier",
    "مندوب توصيل",
    "مندوب كيتا",
    "مندوب هنجرستيشن",
    "مندوب هنقرستيشن",
  ].includes(job);
}

function normalizeLocation(
  value: string | null
):
  | "hunger"
  | "keeta"
  | "both"
  | string {
  const location =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    location ===
      "keetaandhungerstation" ||
    location.includes(
      "both"
    ) ||
    location.includes(
      "كيتا وهنجر"
    )
  ) {
    return "both";
  }

  if (
    location.includes(
      "hunger"
    ) ||
    location.includes(
      "هنجر"
    ) ||
    location.includes(
      "هنقر"
    )
  ) {
    return "hunger";
  }

  if (
    location.includes(
      "keeta"
    ) ||
    location.includes(
      "كيتا"
    )
  ) {
    return "keeta";
  }

  return location;
}

function hasHunger(
  value: string | null
) {
  const location =
    normalizeLocation(value);

  return (
    location ===
      "hunger" ||
    location ===
      "both"
  );
}

function hasKeeta(
  value: string | null
) {
  const location =
    normalizeLocation(value);

  return (
    location ===
      "keeta" ||
    location ===
      "both"
  );
}

function getInitials(
  name: string
) {
  const parts =
    String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length === 0
  ) {
    return "?";
  }

  if (
    parts.length === 1
  ) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0] || ""}${
    parts[1][0] || ""
  }`.toUpperCase();
}

function normalizeSaudiPhone(
  value: string
) {
  let phone =
    value.replace(
      /\D/g,
      ""
    );

  if (
    phone.startsWith(
      "00"
    )
  ) {
    phone =
      phone.slice(2);
  }

  if (
    phone.startsWith(
      "0"
    )
  ) {
    phone =
      "966" +
      phone.slice(1);
  }

  if (
    phone.length ===
    9 &&
    phone.startsWith(
      "5"
    )
  ) {
    phone =
      "966" +
      phone;
  }

  return phone;
}