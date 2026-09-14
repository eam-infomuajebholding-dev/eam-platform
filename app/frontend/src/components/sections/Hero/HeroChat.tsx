import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ExternalLink, Loader2, Map, MessageCircle, Mic, Paperclip, Route, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWorkspace } from "@/features/ai-workspace/WorkspaceContext";
import { getJourneyRoute } from "@/features/ai-workspace/platformResources";
import BuildVillaStepPanel from "@/features/journeys/build-villa/BuildVillaStepPanel";
import EngineeringConsultingStepPanel from "@/features/journeys/engineering-consulting/EngineeringConsultingStepPanel";
import ContractingStepPanel from "@/features/journeys/contracting/ContractingStepPanel";
import type { ContractingContext } from "@/features/journeys/contracting/types";
import { CONTRACTING_JOURNEY_TYPE } from "@/features/journeys/contracting/types";
import ValuationStepPanel from "@/features/journeys/real-estate-valuation/ValuationStepPanel";
import type { RealEstateValuationContext } from "@/features/journeys/real-estate-valuation/types";
import { REAL_ESTATE_VALUATION_JOURNEY_TYPE } from "@/features/journeys/real-estate-valuation/types";
import MaintenanceStepPanel from "@/features/journeys/smart-maintenance/MaintenanceStepPanel";
import type { SmartMaintenanceContext } from "@/features/journeys/smart-maintenance/types";
import { SMART_MAINTENANCE_JOURNEY_TYPE } from "@/features/journeys/smart-maintenance/types";
import ProjectManagementStepPanel from "@/features/journeys/project-management/ProjectManagementStepPanel";
import type { ProjectManagementContext } from "@/features/journeys/project-management/types";
import { PROJECT_MANAGEMENT_JOURNEY_TYPE } from "@/features/journeys/project-management/types";
import FurnishingStepPanel from "@/features/journeys/furnishing/FurnishingStepPanel";
import type { FurnishingContext } from "@/features/journeys/furnishing/types";
import { FURNISHING_JOURNEY_TYPE } from "@/features/journeys/furnishing/types";
import FacilityManagementStepPanel from "@/features/journeys/facility-management/FacilityManagementStepPanel";
import type { FacilityManagementContext } from "@/features/journeys/facility-management/types";
import { FACILITY_MANAGEMENT_JOURNEY_TYPE } from "@/features/journeys/facility-management/types";
import GovernmentServicesStepPanel from "@/features/journeys/government-services/GovernmentServicesStepPanel";
import type { GovernmentServicesContext } from "@/features/journeys/government-services/types";
import { GOVERNMENT_SERVICES_JOURNEY_TYPE } from "@/features/journeys/government-services/types";
import RealEstateDevelopmentStepPanel from "@/features/journeys/real-estate-development/RealEstateDevelopmentStepPanel";
import type { RealEstateDevelopmentContext } from "@/features/journeys/real-estate-development/types";
import { REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE } from "@/features/journeys/real-estate-development/types";
import RealEstateMarketingStepPanel from "@/features/journeys/real-estate-marketing/RealEstateMarketingStepPanel";
import type { RealEstateMarketingContext } from "@/features/journeys/real-estate-marketing/types";
import { REAL_ESTATE_MARKETING_JOURNEY_TYPE } from "@/features/journeys/real-estate-marketing/types";
import BuildingMaterialsStepPanel from "@/features/journeys/building-materials/BuildingMaterialsStepPanel";
import type { BuildingMaterialsContext } from "@/features/journeys/building-materials/types";
import { BUILDING_MATERIALS_JOURNEY_TYPE } from "@/features/journeys/building-materials/types";
import EquipmentStepPanel from "@/features/journeys/equipment/EquipmentStepPanel";
import type { EquipmentContext } from "@/features/journeys/equipment/types";
import { EQUIPMENT_JOURNEY_TYPE } from "@/features/journeys/equipment/types";
import type { BuildVillaContext } from "@/features/journeys/build-villa/types";
import { BUILD_VILLA_JOURNEY_TYPE } from "@/features/journeys/build-villa/types";
import type { EngineeringConsultingContext } from "@/features/journeys/engineering-consulting/types";
import { ENGINEERING_CONSULTING_JOURNEY_TYPE } from "@/features/journeys/engineering-consulting/types";

type HeroChatProps = {
  variant?: "default" | "homepage";
  /** Strip outer card chrome when parent provides the shell (homepage composer). */
  shell?: "default" | "embedded" | "dock";
};

export default function HeroChat({ variant = "default", shell = "default" }: HeroChatProps) {
  const {
    mode,
    messages,
    streamingContent,
    isBusy,
    workspaceError,
    currentInstance,
    stepValues,
    setStepValues,
    ecStepValues,
    setEcStepValues,
    ctStepValues,
    setCtStepValues,
    rvStepValues,
    setRvStepValues,
    smStepValues,
    setSmStepValues,
    pmStepValues,
    setPmStepValues,
    frStepValues,
    setFrStepValues,
    fmStepValues,
    setFmStepValues,
    gsStepValues,
    setGsStepValues,
    redStepValues,
    setRedStepValues,
    rmStepValues,
    setRmStepValues,
    bmStepValues,
    setBmStepValues,
    eqStepValues,
    setEqStepValues,
    fieldErrors,
    formError,
    interactionMode,
    setInteractionMode,
    sendMessage,
    acceptPendingJourney,
    advanceCurrentStep,
    revisitCurrentSection,
    completeCurrentJourney,
    exitCurrentJourney,
  } = useWorkspace();
  const { t, direction, language } = useLanguage();

  const [input, setInput] = useState("");
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isHomepage = variant === "homepage";

  const journeyType = currentInstance?.journey_type ?? null;
  const bvContext = (currentInstance?.context ?? {}) as BuildVillaContext;
  const ecContext = (currentInstance?.context ?? {}) as EngineeringConsultingContext;
  const ctContext = (currentInstance?.context ?? {}) as ContractingContext;
  const rvContext = (currentInstance?.context ?? {}) as RealEstateValuationContext;
  const smContext = (currentInstance?.context ?? {}) as SmartMaintenanceContext;
  const pmContext = (currentInstance?.context ?? {}) as ProjectManagementContext;
  const frContext = (currentInstance?.context ?? {}) as FurnishingContext;
  const fmContext = (currentInstance?.context ?? {}) as FacilityManagementContext;
  const gsContext = (currentInstance?.context ?? {}) as GovernmentServicesContext;
  const redContext = (currentInstance?.context ?? {}) as RealEstateDevelopmentContext;
  const rmContext = (currentInstance?.context ?? {}) as RealEstateMarketingContext;
  const bmContext = (currentInstance?.context ?? {}) as BuildingMaterialsContext;
  const eqContext = (currentInstance?.context ?? {}) as EquipmentContext;
  const currentStep = currentInstance?.current_step_key ?? null;
  const isCompleted = currentInstance?.status === "completed";
  const isTerminal =
    currentStep === "intake_complete" || currentStep === "handoff_complete";
  const isJourneyMode =
    mode === "journey" &&
    currentInstance != null &&
    currentInstance.status !== "completed";

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingContent, mode, currentStep]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isBusy || isJourneyMode) {
      return;
    }

    let message = trimmed;
    if (attachedFileName) {
      message = `${trimmed}\n[${t("chat.attachmentAdded")}: ${attachedFileName}]`;
      setAttachedFileName(null);
    }

    setInput("");
    await sendMessage(message);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
    }
    event.target.value = "";
  };

  const startVoiceInput = () => {
    if (isBusy || isJourneyMode || isListening) {
      return;
    }

    const SpeechRecognitionCtor =
      (window as Window & { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ??
      (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognition })
        .webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      window.alert(t("chat.voiceUnsupported"));
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = language.startsWith("ar") ? "ar-SA" : language.startsWith("en") ? "en-US" : language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };

    recognition.start();
  };

  const isDock = isHomepage && shell === "dock";
  const isEmbedded = isHomepage && (shell === "embedded" || shell === "dock");

  const cardClass = isDock
    ? "home-hero-chat home-hero-chat-dock w-full overflow-hidden bg-white dark:bg-[var(--eam-home-cream-light)]"
    : isEmbedded
    ? "home-hero-chat w-full overflow-hidden bg-white dark:bg-[var(--eam-home-cream-light)]"
    : isHomepage
      ? "home-hero-chat mx-auto w-full overflow-hidden rounded-[18px] border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)]/92 shadow-[0_2px_14px_rgba(139,77,0,0.08)] dark:border-white/10 dark:bg-dark"
      : "mx-auto w-full max-w-4xl overflow-hidden rounded-[28px] border border-soft-border bg-cream shadow-md dark:border-white/10 dark:bg-dark";

  const homepageCompact = isHomepage && !isJourneyMode && messages.length === 0 && !streamingContent;
  const composerPlaceholder =
    interactionMode === "journey"
      ? t("chat.placeholder.journey")
      : isHomepage
        ? t("chat.placeholder.free")
        : t("chat.placeholder.general");

  return (
    <div className={isHomepage ? "home-hero-chat-wrap" : "-mt-0"}>
      {isHomepage && !isEmbedded ? (
        <p className="mb-1 text-center text-[13px] font-semibold text-[var(--eam-home-gold-deep)]">
          {t("chat.brand")}
        </p>
      ) : !isHomepage ? (
        <div className="mb-1 text-center">
          <p className="mx-auto max-w-3xl text-base leading-7 text-ink/70 dark:text-white/80">
            {t("chat.defaultDescription")}
          </p>
        </div>
      ) : null}

      <div className={cardClass}>
        {!isJourneyMode ? (
          <div
            className="flex items-center gap-1 border-b border-[var(--eam-home-border)]/70 bg-[var(--eam-home-cream-light)] px-2 py-1.5 dark:border-white/10 dark:bg-white/5"
            role="tablist"
            aria-label={t("chat.interactionAria")}
          >
            <button
              type="button"
              role="tab"
              aria-selected={interactionMode === "free"}
              onClick={() => setInteractionMode("free")}
              disabled={isBusy}
              className={`inline-flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium transition ${
                interactionMode === "free"
                  ? "bg-white text-[var(--eam-home-gold-deep)] shadow-sm dark:bg-white/10 dark:text-gold"
                  : "text-[var(--eam-home-ink)]/60 hover:text-[var(--eam-home-gold-deep)] dark:text-white/60"
              }`}
            >
              <MessageCircle className="h-3 w-3" />
              {t("chat.tab.free")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={interactionMode === "journey"}
              onClick={() => setInteractionMode("journey")}
              disabled={isBusy}
              className={`inline-flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium transition ${
                interactionMode === "journey"
                  ? "bg-white text-[var(--eam-home-gold-deep)] shadow-sm dark:bg-white/10 dark:text-gold"
                  : "text-[var(--eam-home-ink)]/60 hover:text-[var(--eam-home-gold-deep)] dark:text-white/60"
              }`}
            >
              <Route className="h-3 w-3" />
              {t("chat.tab.journey")}
            </button>
          </div>
        ) : null}

        {isJourneyMode ? (
          <div className="flex items-center justify-between gap-2 border-b border-[var(--eam-home-border)]/70 bg-[var(--eam-home-cream-light)] px-3 py-2 dark:border-white/10 dark:bg-white/5">
            <span className="truncate text-[11px] font-medium text-[var(--eam-home-ink)]/70 dark:text-white/70">
              {t("chat.journeyBanner")}
            </span>
            <button
              type="button"
              onClick={() => void exitCurrentJourney()}
              disabled={isBusy}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--eam-home-border)] bg-white px-2.5 py-1 text-[11px] font-medium text-[var(--eam-home-gold-deep)] transition hover:border-[var(--eam-home-gold)] hover:bg-[var(--eam-home-cream-light)] disabled:opacity-60 dark:border-white/15 dark:bg-transparent dark:text-gold"
              aria-label={t("chat.exitJourney")}
            >
              <X className="h-3.5 w-3.5" />
              {t("chat.exitJourney")}
            </button>
          </div>
        ) : null}

        {(messages.length > 0 || streamingContent || isJourneyMode) && (
          <div
            ref={messagesRef}
            className={`overflow-y-auto space-y-3 border-b border-soft-border/40 dark:border-white/10 ${
              isHomepage ? "max-h-[min(38vh,280px)] px-4 py-3" : "max-h-[320px] px-7 py-5"
            }`}
            dir={direction}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "ms-8 bg-surface-alt text-ink dark:bg-white/10 dark:text-white"
                    : "me-8 bg-gold/10 text-ink/90"
                }`}
              >
                {message.content}

                {message.role === "assistant" && message.resourceLinks && message.resourceLinks.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {message.resourceLinks.map((link) => (
                      <Link
                        key={`${message.id}-${link.href}`}
                        to={link.href}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--eam-home-border)] bg-white px-2.5 py-1 text-[11px] font-medium text-[var(--eam-home-gold-deep)] transition hover:border-[var(--eam-home-gold)] dark:border-white/15 dark:bg-transparent dark:text-gold"
                      >
                        <Map className="h-3 w-3" />
                        {link.label}
                        <ExternalLink className="h-3 w-3 opacity-70" />
                      </Link>
                    ))}
                  </div>
                ) : null}

                {message.role === "assistant" &&
                interactionMode === "free" &&
                message.journeyOffer &&
                !isJourneyMode ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => void acceptPendingJourney(message.journeyOffer!)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1 rounded-full bg-[var(--eam-home-gold-deep)] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                    >
                      <Route className="h-3 w-3" />
                      {t("chat.enterJourney")}: {message.journeyOffer.label}
                    </button>
                    {getJourneyRoute(message.journeyOffer.journeyType) ? (
                      <Link
                        to={getJourneyRoute(message.journeyOffer.journeyType)!}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--eam-home-border)] bg-white px-2.5 py-1 text-[11px] font-medium text-[var(--eam-home-ink)]/80 transition hover:border-[var(--eam-home-gold)] dark:border-white/15 dark:text-white/80"
                      >
                        {t("chat.explore")} {message.journeyOffer.label}
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}

            {streamingContent ? (
              <div className="me-8 rounded-2xl bg-gold/10 px-4 py-3 text-sm leading-relaxed dark:text-white/90">
                {streamingContent}
                <span className="inline-block h-4 w-1 animate-pulse bg-gold/70 align-middle" />
              </div>
            ) : null}

            {isJourneyMode && !isCompleted && journeyType === BUILD_VILLA_JOURNEY_TYPE ? (
              <BuildVillaStepPanel
                currentStep={currentStep}
                context={bvContext}
                values={stepValues}
                onChange={setStepValues}
                fieldErrors={fieldErrors}
                formError={formError}
                isLoading={isBusy}
                isTerminal={isTerminal}
                isCompleted={isCompleted}
                onAdvance={advanceCurrentStep}
                onComplete={completeCurrentJourney}
                onRevisit={revisitCurrentSection}
                compact
              />
            ) : null}

            {isJourneyMode && !isCompleted && journeyType === ENGINEERING_CONSULTING_JOURNEY_TYPE ? (
              <EngineeringConsultingStepPanel
                currentStep={currentStep}
                context={ecContext}
                values={ecStepValues}
                onChange={setEcStepValues}
                fieldErrors={fieldErrors}
                formError={formError}
                isLoading={isBusy}
                isTerminal={isTerminal}
                isCompleted={isCompleted}
                onAdvance={advanceCurrentStep}
                onComplete={completeCurrentJourney}
              />
            ) : null}

            {isJourneyMode && !isCompleted && journeyType === CONTRACTING_JOURNEY_TYPE ? (
              <ContractingStepPanel
                currentStep={currentStep}
                context={ctContext}
                values={ctStepValues}
                onChange={setCtStepValues}
                fieldErrors={fieldErrors}
                formError={formError}
                isLoading={isBusy}
                isTerminal={isTerminal}
                isCompleted={isCompleted}
                onAdvance={advanceCurrentStep}
                onComplete={completeCurrentJourney}
              />
            ) : null}

            {isJourneyMode && !isCompleted && journeyType === REAL_ESTATE_VALUATION_JOURNEY_TYPE ? (
              <ValuationStepPanel
                currentStep={currentStep}
                context={rvContext}
                values={rvStepValues}
                onChange={setRvStepValues}
                fieldErrors={fieldErrors}
                formError={formError}
                isLoading={isBusy}
                isTerminal={isTerminal}
                isCompleted={isCompleted}
                onAdvance={advanceCurrentStep}
                onComplete={completeCurrentJourney}
              />
            ) : null}

            {isJourneyMode && !isCompleted && journeyType === SMART_MAINTENANCE_JOURNEY_TYPE ? (
              <MaintenanceStepPanel
                currentStep={currentStep}
                context={smContext}
                values={smStepValues}
                onChange={setSmStepValues}
                fieldErrors={fieldErrors}
                formError={formError}
                isLoading={isBusy}
                isTerminal={isTerminal}
                isCompleted={isCompleted}
                onAdvance={advanceCurrentStep}
                onComplete={completeCurrentJourney}
              />
            ) : null}

            {isJourneyMode && !isCompleted && journeyType === PROJECT_MANAGEMENT_JOURNEY_TYPE ? (
              <ProjectManagementStepPanel
                currentStep={currentStep}
                context={pmContext}
                values={pmStepValues}
                onChange={setPmStepValues}
                fieldErrors={fieldErrors}
                formError={formError}
                isLoading={isBusy}
                isTerminal={isTerminal}
                isCompleted={isCompleted}
                onAdvance={advanceCurrentStep}
                onComplete={completeCurrentJourney}
              />
            ) : null}

            {isJourneyMode && !isCompleted && journeyType === FURNISHING_JOURNEY_TYPE ? (
              <FurnishingStepPanel
                currentStep={currentStep}
                context={frContext}
                values={frStepValues}
                onChange={setFrStepValues}
                fieldErrors={fieldErrors}
                formError={formError}
                isLoading={isBusy}
                isTerminal={isTerminal}
                isCompleted={isCompleted}
                onAdvance={advanceCurrentStep}
                onComplete={completeCurrentJourney}
              />
            ) : null}

            {isJourneyMode && !isCompleted && journeyType === FACILITY_MANAGEMENT_JOURNEY_TYPE ? (
              <FacilityManagementStepPanel
                currentStep={currentStep}
                context={fmContext}
                values={fmStepValues}
                onChange={setFmStepValues}
                fieldErrors={fieldErrors}
                formError={formError}
                isLoading={isBusy}
                isTerminal={isTerminal}
                isCompleted={isCompleted}
                onAdvance={advanceCurrentStep}
                onComplete={completeCurrentJourney}
              />
            ) : null}

            {isJourneyMode && !isCompleted && journeyType === GOVERNMENT_SERVICES_JOURNEY_TYPE ? (
              <GovernmentServicesStepPanel
                currentStep={currentStep}
                context={gsContext}
                values={gsStepValues}
                onChange={setGsStepValues}
                fieldErrors={fieldErrors}
                formError={formError}
                isLoading={isBusy}
                isTerminal={isTerminal}
                isCompleted={isCompleted}
                onAdvance={advanceCurrentStep}
                onComplete={completeCurrentJourney}
              />
            ) : null}

            {isJourneyMode && !isCompleted && journeyType === REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE ? (
              <RealEstateDevelopmentStepPanel
                currentStep={currentStep}
                context={redContext}
                values={redStepValues}
                onChange={setRedStepValues}
                fieldErrors={fieldErrors}
                formError={formError}
                isLoading={isBusy}
                isTerminal={isTerminal}
                isCompleted={isCompleted}
                onAdvance={advanceCurrentStep}
                onComplete={completeCurrentJourney}
              />
            ) : null}

            {isJourneyMode && !isCompleted && journeyType === REAL_ESTATE_MARKETING_JOURNEY_TYPE ? (
              <RealEstateMarketingStepPanel
                currentStep={currentStep}
                context={rmContext}
                values={rmStepValues}
                onChange={setRmStepValues}
                fieldErrors={fieldErrors}
                formError={formError}
                isLoading={isBusy}
                isTerminal={isTerminal}
                isCompleted={isCompleted}
                onAdvance={advanceCurrentStep}
                onComplete={completeCurrentJourney}
              />
            ) : null}

            {isJourneyMode && !isCompleted && journeyType === BUILDING_MATERIALS_JOURNEY_TYPE ? (
              <BuildingMaterialsStepPanel
                currentStep={currentStep}
                context={bmContext}
                values={bmStepValues}
                onChange={setBmStepValues}
                fieldErrors={fieldErrors}
                formError={formError}
                isLoading={isBusy}
                isTerminal={isTerminal}
                isCompleted={isCompleted}
                onAdvance={advanceCurrentStep}
                onComplete={completeCurrentJourney}
              />
            ) : null}

            {isJourneyMode && !isCompleted && journeyType === EQUIPMENT_JOURNEY_TYPE ? (
              <EquipmentStepPanel
                currentStep={currentStep}
                context={eqContext}
                values={eqStepValues}
                onChange={setEqStepValues}
                fieldErrors={fieldErrors}
                formError={formError}
                isLoading={isBusy}
                isTerminal={isTerminal}
                isCompleted={isCompleted}
                onAdvance={advanceCurrentStep}
                onComplete={completeCurrentJourney}
              />
            ) : null}

            {isCompleted ? (
              <div className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-950/20 dark:text-green-200">
                {t("chat.journeyComplete")}
              </div>
            ) : null}
          </div>
        )}

        {workspaceError && !isJourneyMode ? (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200 md:px-7 md:py-3">
            {workspaceError}
          </div>
        ) : null}

        {attachedFileName && isDock ? (
          <div className="flex items-center justify-between gap-2 border-b border-[var(--eam-home-border)]/60 bg-[var(--eam-home-cream-light)]/80 px-3 py-1.5 text-[11px] text-[var(--eam-home-ink)]/75">
            <span className="truncate">
              {t("chat.attachmentAdded")}: {attachedFileName}
            </span>
            <button
              type="button"
              onClick={() => setAttachedFileName(null)}
              className="shrink-0 text-[var(--eam-home-gold-deep)]"
              aria-label={t("chat.attach")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}

        {isDock ? (
          <div className="home-assistant-composer flex min-h-[48px] items-center gap-1.5 border-t border-[var(--eam-home-border)]/70 bg-white px-2.5 py-2 dark:bg-[var(--eam-home-cream-light)]">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              aria-hidden
              tabIndex={-1}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy || isJourneyMode}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--eam-home-ink)]/55 transition hover:bg-[var(--eam-home-cream-light)] hover:text-[var(--eam-home-gold-deep)] disabled:opacity-50"
              aria-label={t("chat.attach")}
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <textarea
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isBusy || isJourneyMode}
              placeholder={
                isListening
                  ? t("chat.voiceListening")
                  : isJourneyMode
                    ? t("chat.placeholder.journeyActive")
                    : composerPlaceholder
              }
              className={`min-h-[36px] max-h-[72px] flex-1 resize-none rounded-xl border border-[var(--eam-home-border)] bg-white px-3 py-2 text-[13px] leading-5 text-ink outline-none placeholder:text-ink/55 focus:border-[var(--eam-home-gold)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/55 ${
                isJourneyMode ? "opacity-60" : ""
              }`}
              dir={direction}
            />
            <button
              type="button"
              onClick={startVoiceInput}
              disabled={isBusy || isJourneyMode}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--eam-home-cream-light)] disabled:opacity-50 ${
                isListening ? "text-[var(--eam-home-gold-deep)]" : "text-[var(--eam-home-ink)]/55 hover:text-[var(--eam-home-gold-deep)]"
              }`}
              aria-label={t("chat.voice")}
            >
              {isListening ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={isBusy || isJourneyMode || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2B2118] text-white transition hover:bg-[#1a1a2e] disabled:opacity-50"
              aria-label={t("chat.send")}
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
        ) : homepageCompact ? (
          <div
            className={`flex min-h-[40px] items-center gap-1 px-2 py-1.5 ${
              isEmbedded ? "bg-white dark:bg-[var(--eam-home-cream-light)]" : ""
            }`}
          >
            <textarea
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isBusy}
              placeholder={composerPlaceholder}
              className={`min-h-[32px] max-h-[32px] flex-1 resize-none border-0 px-2 py-1.5 text-[12px] leading-5 text-ink outline-none placeholder:text-ink/55 dark:text-white dark:placeholder:text-white/55 ${
                isEmbedded ? "bg-white dark:bg-[var(--eam-home-cream-light)]" : "bg-transparent"
              }`}
              dir={direction}
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={isBusy || !input.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-white disabled:opacity-50"
              aria-label={t("chat.send")}
            >
              {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowUp className="h-3.5 w-3.5" />}
            </button>
          </div>
        ) : (
          <div className={`flex items-end gap-2 ${isHomepage ? "px-3 py-2" : "px-5 py-4 md:px-7"}`}>
            {!isHomepage ? (
              <>
                <button type="button" className="rounded-full p-2 text-ink/50 hover:bg-surface-alt dark:hover:bg-white/10" aria-label={t("chat.attach")}>
                  <Paperclip className="h-5 w-5" />
                </button>
                <button type="button" className="rounded-full p-2 text-ink/50 hover:bg-surface-alt dark:hover:bg-white/10" aria-label={t("chat.voice")}>
                  <Mic className="h-5 w-5" />
                </button>
              </>
            ) : null}
            <textarea
              rows={isHomepage ? 1 : 2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isBusy || isJourneyMode}
              placeholder={
                isJourneyMode ? t("chat.placeholder.journeyActive") : composerPlaceholder
              }
              className={`flex-1 resize-none rounded-2xl border border-soft-border/80 bg-white px-4 py-3 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white ${
                isJourneyMode ? "opacity-60" : ""
              }`}
              dir={direction}
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={isBusy || isJourneyMode || !input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-white disabled:opacity-50"
              aria-label={t("chat.send")}
            >
              {isBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
