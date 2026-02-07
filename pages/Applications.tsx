import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  User,
  TenantApplication,
  ApplicationStatus,
  NotificationType,
  UserRole,
  FormTemplate,
} from "../types";
import { getStore, saveStore } from "../store";
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  UserCheck,
  Camera,
  Calendar,
  FileText,
  Eye,
  Download,
  Plus,
  X,
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { DEFAULT_TEMPLATE } from "../utils/defaults";

// Simplified components from the original file for brevity
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => <div className="space-y-6 break-inside-avoid"><h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.4em] border-b border-zinc-100 dark:border-zinc-800 pb-2">{title}</h3>{children}</div>;
const PrintRow: React.FC<{ label: string; value: any }> = ({ label, value }) => <div className="mb-4"><p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 truncate">{label}</p><p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight break-words">{value || "N/A"}</p></div>;

interface ApplicationsProps {
  user: User;
  onNavigate: (view: string) => void;
  onUpdate?: () => void;
}

const Applications: React.FC<ApplicationsProps> = ({
  user,
  onNavigate,
  onUpdate,
}) => {
  const [store, setStore] = useState(getStore());
  const [viewMode, setViewMode] = useState<"gate" | "form" | "history">("gate");
  const [targetAgentId, setTargetAgentId] = useState(
    localStorage.getItem("referral_agent_id") || ""
  );
  const [targetAgent, setTargetAgent] = useState<User | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<FormTemplate | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingAgent, setIsSearchingAgent] = useState(false);
  const [viewingApp, setViewingApp] = useState<TenantApplication | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (targetAgentId) {
      validateAgent(targetAgentId);
    }
  }, []);

  const validateAgent = (id: string) => {
    setIsSearchingAgent(true);
    setTimeout(() => {
      const agent = store.users.find(
        (u) =>
          u.displayId.toLowerCase() === id.toLowerCase() &&
          u.role === UserRole.AGENT
      );
      if (agent) {
        setTargetAgent(agent);
        const template =
          store.formTemplates.find((t) => t.agentId === agent.id) ||
          DEFAULT_TEMPLATE;
        setActiveTemplate(template);
        setViewMode("form");
        setFormData((prev) => ({ ...prev, agentIdCode: agent.displayId }));
      } else {
        setTargetAgent(null);
      }
      setIsSearchingAgent(false);
    }, 600);
  };

 const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (
    key: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange(key, reader.result as string);
    };
    reader.readAsDataURL(file);
  };


  const handleSubmitApplication = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const appRecord: TenantApplication = {
        id: `app${Date.now()}`,
        userId: user.id,
        propertyId: "PENDING",
        agentId: targetAgent?.id || "u1", 
        status: ApplicationStatus.PENDING,
        submissionDate: new Date().toISOString(),
        firstName: formData.firstName || "",
        surname: formData.surname || "",
        middleName: formData.middleName || "",
        dob: formData.dob || "",
        maritalStatus: formData.maritalStatus || "Single",
        gender: formData.gender || "Male",
        currentHomeAddress: formData.currentHomeAddress || "",
        occupation: formData.occupation || "",
        familySize: Number(formData.familySize) || 1,
        phoneNumber: formData.phoneNumber || "",
        reasonForRelocating: formData.reasonForRelocating || "",
        currentLandlordName: formData.currentLandlordName || "",
        currentLandlordPhone: formData.currentLandlordPhone || "",
        verificationType: formData.verificationType || "",
        verificationIdNumber: formData.verificationIdNumber || "",
        verificationUrl: formData.verificationUrl,
        passportPhotoUrl: formData.passportPhotoUrl,
        agentIdCode: targetAgent?.displayId || "",
        signature: formData.signature || "",
        applicationDate: formData.applicationDate || new Date().toISOString().split("T")[0],
        customResponses: formData,
      };

      const newState = {
        ...store,
        applications: [...store.applications, appRecord],
        notifications: [
          {
            id: `n_app_${Date.now()}`,
            userId: appRecord.agentId,
            title: "New Tenancy Application",
            message: `A new candidate has submitted a dossier via your custom form.`,
            type: NotificationType.APPLICATION,
            timestamp: new Date().toISOString(),
            isRead: false,
            linkTo: "screenings",
          },
          ...store.notifications,
        ],
      };

      saveStore(newState);
      setStore(newState);
      setIsSubmitting(false);
      setViewMode("history");
      setFormData({});
      setCurrentStepIndex(0);
      if (onUpdate) onUpdate();
    }, 1500);
  };

 const myApplications = useMemo(() => {
    return store.applications
      .filter((app) => app.userId === user.id)
      .sort(
        (a, b) =>
          new Date(b.submissionDate).getTime() -
          new Date(a.submissionDate).getTime(),
      );
  }, [store.applications, user.id]);


  const generatePDF = async (app: TenantApplication) => {
    setIsDownloading(true);
    const input = document.getElementById("printable-content");
    if (!input) {
      setIsDownloading(false);
      return;
    }
    try {
      const canvas = await html2canvas(input, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`SPACEYA_Application_${app.id}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

 const handleDownloadPDF = async (app: TenantApplication) => {
    if (!viewingApp || viewingApp.id !== app.id) {
      setViewingApp(app);
      setTimeout(() => generatePDF(app), 500);
      return;
    }
    generatePDF(app);
  };


  if (viewMode === "gate") {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-8 pb-20 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white dark:bg-zinc-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 max-w-lg w-full text-center space-y-8">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl shadow-blue-600/20">
            <ShieldCheck size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Agent Verification</h2>
            <p className="text-zinc-500 font-medium mt-2 text-sm">Enter the unique ID of your leasing agent to access their specific enrollment form.</p>
          </div>
          <div className="relative">
            <UserCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              className="w-full pl-14 pr-6 py-6 bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl text-lg font-bold text-center tracking-widest outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              placeholder="AGT-12345"
              value={targetAgentId}
              onChange={(e) => setTargetAgentId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && validateAgent(targetAgentId)}
            />
          </div>
          <button
            onClick={() => validateAgent(targetAgentId)}
            disabled={isSearchingAgent || !targetAgentId}
            className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSearchingAgent ? <Loader2 className="animate-spin" /> : <ArrowRight />}
            {isSearchingAgent ? "Verifying..." : "Access Form"}
          </button>
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <button onClick={() => setViewMode("history")} className="text-zinc-400 font-bold text-xs hover:text-blue-600 transition-colors uppercase tracking-widest">View My Submitted Dossiers</button>
          </div>
        </div>
      </div>
    );
  }

  // ... The rest of the component remains unchanged ...
return <div>Applications</div>;

};

export default Applications;
