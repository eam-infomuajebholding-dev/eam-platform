import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ArrowUp, Loader2, Mic, Paperclip } from "lucide-react";
import { useWorkspace } from "@/features/ai-workspace/WorkspaceContext";
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
};

export default function HeroChat({ variant = "default" }: HeroChatProps) {
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
    sendMessage,
    advanceCurrentStep,
    revisitCurrentSection,
    completeCurrentJourney,
  } = useWorkspace();

  const [input, setInput] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);
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
    setInput("");
    await sendMessage(trimmed);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const cardClass = isHomepage
    ? "home-hero-chat mx-auto w-full overflow-hidden rounded-[18px] border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)]/92 shadow-[0_2px_14px_rgba(139,77,0,0.08)] dark:border-white/10 dark:bg-dark"
    : "mx-auto w-full max-w-4xl overflow-hidden rounded-[28px] border border-soft-border bg-cream shadow-md dark:border-white/10 dark:bg-dark";

  const homepageCompact = isHomepage && !isJourneyMode && messages.length === 0 && !streamingContent;

  return (
    <div className={isHomepage ? "home-hero-chat-wrap" : "-mt-0"}>
      {isHomepage ? (
        <p className="mb-1 text-center text-[13px] font-semibold text-[var(--eam-home-gold-deep)]">
          ابدأ رحلتك معنا من هنا
        </p>
      ) : (
        <div className="mb-1 text-center">
          <p className="mx-auto max-w-3xl text-base leading-7 text-ink/70 dark:text-white/80">
            مساعد هندسي ذكي يساعدك في اختيار الخدمة المناسبة،
            وتقدير المتطلبات، وبدء رحلتك مع فريق إعمار.
          </p>
        </div>
      )}

      <div className={cardClass}>
        {(messages.length > 0 || streamingContent || isJourneyMode) && (
          <div
            ref={messagesRef}
            className={`overflow-y-auto space-y-3 border-b border-gray-100 dark:border-white/10 ${
              isHomepage ? "max-h-[220px] px-4 py-3" : "max-h-[320px] px-7 py-5"
            }`}
            dir="rtl"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl px-4 py-3 text-sm font-tajawal leading-relaxed ${
                  message.role === "user"
                    ? "ms-8 bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white"
                    : "me-8 bg-gold/10 text-gray-800 dark:text-white/90"
                }`}
              >
                {message.content}
              </div>
            ))}

            {streamingContent ? (
              <div className="me-8 rounded-2xl bg-gold/10 px-4 py-3 text-sm font-tajawal leading-relaxed dark:text-white/90">
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
              <div className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-tajawal text-green-800 dark:bg-green-950/20 dark:text-green-200">
                تم إكمال رحلة جمع المعلومات بنجاح.
              </div>
            ) : null}
          </div>
        )}

        {workspaceError && !isJourneyMode ? (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm font-tajawal text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200 md:px-7 md:py-3">
            {workspaceError}
          </div>
        ) : null}

        {homepageCompact ? (
          <div className="flex min-h-[44px] items-center gap-1 px-2 py-1.5">
            <textarea
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isBusy}
              placeholder="صف مشروعك أو اطرح سؤالك..."
              className="min-h-[36px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-[13px] font-tajawal text-ink outline-none placeholder:text-ink/45 dark:text-white dark:placeholder:text-white/45"
              dir="rtl"
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={isBusy || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-white disabled:opacity-50"
              aria-label="إرسال"
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
        ) : (
          <div className={`flex items-end gap-2 ${isHomepage ? "px-3 py-2" : "px-5 py-4 md:px-7"}`}>
            {!isHomepage ? (
              <>
                <button type="button" className="rounded-full p-2 text-ink/50 hover:bg-gray-100 dark:hover:bg-white/10" aria-label="إرفاق">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button type="button" className="rounded-full p-2 text-ink/50 hover:bg-gray-100 dark:hover:bg-white/10" aria-label="صوت">
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
                isJourneyMode
                  ? "أكمل الخطوات أعلاه للمتابعة..."
                  : "صف مشروعك أو اطرح سؤالك..."
              }
              className={`flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 font-tajawal text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white ${
                isJourneyMode ? "opacity-60" : ""
              }`}
              dir="rtl"
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={isBusy || isJourneyMode || !input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-white disabled:opacity-50"
              aria-label="إرسال"
            >
              {isBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
