import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import * as aiCoreClient from '@/features/ai-workspace/aiCoreClient';
import {
  actionFailureMessage,
  executeActionProposal,
  executeStartJourney,
} from '@/features/ai-workspace/actionExecutor';
import { setActiveJourneyInstanceId } from '@/features/journeys/core/josClient';
import {
  BUILD_VILLA_INTENT_HINT,
  BUILD_VILLA_QUICK_ACTION_LABEL,
  type WorkspaceMessage,
} from '@/features/ai-workspace/types';
import { useJourney } from '@/features/journeys/core/useJourney';
import type { JourneyInstance } from '@/features/journeys/core/types';
import {
  buildAdvanceInput as buildBvAdvanceInput,
  emptyStepValues as emptyBvStepValues,
  extractExistingInstanceId,
  extractFieldErrors as extractBvFieldErrors,
  getErrorMessage as getBvErrorMessage,
  syncStepValuesFromContext as syncBvStepValuesFromContext,
  type BuildVillaStepValues,
} from '@/features/journeys/build-villa/errors';
import type { BuildVillaContext, FieldValidationErrorDetail } from '@/features/journeys/build-villa/types';
import { BUILD_VILLA_JOURNEY_TYPE } from '@/features/journeys/build-villa/types';
import {
  buildAdvanceInput as buildEcAdvanceInput,
  extractFieldErrors as extractEcFieldErrors,
  getErrorMessage as getEcErrorMessage,
  type EngineeringStepValues,
} from '@/features/journeys/engineering-consulting/errors';
import {
  buildAdvanceInput as buildCtAdvanceInput,
  extractFieldErrors as extractCtFieldErrors,
  getErrorMessage as getCtErrorMessage,
  type ContractingStepValues,
} from '@/features/journeys/contracting/errors';
import {
  CONTRACTING_JOURNEY_TYPE,
  type ContractingContext,
} from '@/features/journeys/contracting/types';
import {
  buildAdvanceInput as buildRvAdvanceInput,
  extractFieldErrors as extractRvFieldErrors,
  getErrorMessage as getRvErrorMessage,
  type ValuationStepValues,
} from '@/features/journeys/real-estate-valuation/errors';
import {
  REAL_ESTATE_VALUATION_JOURNEY_TYPE,
  type RealEstateValuationContext,
} from '@/features/journeys/real-estate-valuation/types';
import {
  buildAdvanceInput as buildSmAdvanceInput,
  extractFieldErrors as extractSmFieldErrors,
  getErrorMessage as getSmErrorMessage,
  type MaintenanceStepValues,
} from '@/features/journeys/smart-maintenance/errors';
import {
  SMART_MAINTENANCE_JOURNEY_TYPE,
  type SmartMaintenanceContext,
} from '@/features/journeys/smart-maintenance/types';
import {
  buildAdvanceInput as buildPmAdvanceInput,
  extractFieldErrors as extractPmFieldErrors,
  getErrorMessage as getPmErrorMessage,
  type ProjectManagementStepValues,
} from '@/features/journeys/project-management/errors';
import {
  PROJECT_MANAGEMENT_JOURNEY_TYPE,
  type ProjectManagementContext,
} from '@/features/journeys/project-management/types';
import {
  buildAdvanceInput as buildFrAdvanceInput,
  extractFieldErrors as extractFrFieldErrors,
  getErrorMessage as getFrErrorMessage,
  type FurnishingStepValues,
} from '@/features/journeys/furnishing/errors';
import {
  FURNISHING_JOURNEY_TYPE,
  type FurnishingContext,
} from '@/features/journeys/furnishing/types';
import {
  buildAdvanceInput as buildFmAdvanceInput,
  extractFieldErrors as extractFmFieldErrors,
  getErrorMessage as getFmErrorMessage,
  type FacilityManagementStepValues,
} from '@/features/journeys/facility-management/errors';
import {
  FACILITY_MANAGEMENT_JOURNEY_TYPE,
  type FacilityManagementContext,
} from '@/features/journeys/facility-management/types';
import {
  buildAdvanceInput as buildGsAdvanceInput,
  extractFieldErrors as extractGsFieldErrors,
  getErrorMessage as getGsErrorMessage,
  type GovernmentServicesStepValues,
} from '@/features/journeys/government-services/errors';
import {
  GOVERNMENT_SERVICES_JOURNEY_TYPE,
  type GovernmentServicesContext,
} from '@/features/journeys/government-services/types';
import {
  buildAdvanceInput as buildRedAdvanceInput,
  extractFieldErrors as extractRedFieldErrors,
  getErrorMessage as getRedErrorMessage,
  type RealEstateDevelopmentStepValues,
} from '@/features/journeys/real-estate-development/errors';
import {
  REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE,
  type RealEstateDevelopmentContext,
} from '@/features/journeys/real-estate-development/types';
import {
  buildAdvanceInput as buildRmAdvanceInput,
  extractFieldErrors as extractRmFieldErrors,
  getErrorMessage as getRmErrorMessage,
  type RealEstateMarketingStepValues,
} from '@/features/journeys/real-estate-marketing/errors';
import {
  REAL_ESTATE_MARKETING_JOURNEY_TYPE,
  type RealEstateMarketingContext,
} from '@/features/journeys/real-estate-marketing/types';
import {
  buildAdvanceInput as buildBmAdvanceInput,
  extractFieldErrors as extractBmFieldErrors,
  getErrorMessage as getBmErrorMessage,
  type BuildingMaterialsStepValues,
} from '@/features/journeys/building-materials/errors';
import {
  BUILDING_MATERIALS_JOURNEY_TYPE,
  type BuildingMaterialsContext,
} from '@/features/journeys/building-materials/types';
import {
  buildAdvanceInput as buildEqAdvanceInput,
  extractFieldErrors as extractEqFieldErrors,
  getErrorMessage as getEqErrorMessage,
  type EquipmentStepValues,
} from '@/features/journeys/equipment/errors';
import {
  EQUIPMENT_JOURNEY_TYPE,
  type EquipmentContext,
} from '@/features/journeys/equipment/types';
import {
  ENGINEERING_CONSULTING_JOURNEY_TYPE,
  type EngineeringConsultingContext,
} from '@/features/journeys/engineering-consulting/types';

type WorkspaceMode = 'chat' | 'journey';

const SUPPORTED_JOURNEY_TYPES = new Set([
  BUILD_VILLA_JOURNEY_TYPE,
  ENGINEERING_CONSULTING_JOURNEY_TYPE,
  CONTRACTING_JOURNEY_TYPE,
  REAL_ESTATE_VALUATION_JOURNEY_TYPE,
  SMART_MAINTENANCE_JOURNEY_TYPE,
  PROJECT_MANAGEMENT_JOURNEY_TYPE,
  FURNISHING_JOURNEY_TYPE,
  FACILITY_MANAGEMENT_JOURNEY_TYPE,
  GOVERNMENT_SERVICES_JOURNEY_TYPE,
  REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE,
  REAL_ESTATE_MARKETING_JOURNEY_TYPE,
  BUILDING_MATERIALS_JOURNEY_TYPE,
  EQUIPMENT_JOURNEY_TYPE,
]);

interface CompletionNotice {
  kind: 'authenticated' | 'anonymous';
  serviceRequestId?: number | null;
}

interface WorkspaceContextValue {
  mode: WorkspaceMode;
  messages: WorkspaceMessage[];
  streamingContent: string;
  isBusy: boolean;
  workspaceError: string | null;
  currentInstance: JourneyInstance | null;
  completionNotice: CompletionNotice | null;
  stepValues: BuildVillaStepValues;
  setStepValues: (values: BuildVillaStepValues) => void;
  ecStepValues: EngineeringStepValues;
  setEcStepValues: (values: EngineeringStepValues) => void;
  ctStepValues: ContractingStepValues;
  setCtStepValues: (values: ContractingStepValues) => void;
  rvStepValues: ValuationStepValues;
  setRvStepValues: (values: ValuationStepValues) => void;
  smStepValues: MaintenanceStepValues;
  setSmStepValues: (values: MaintenanceStepValues) => void;
  pmStepValues: ProjectManagementStepValues;
  setPmStepValues: (values: ProjectManagementStepValues) => void;
  frStepValues: FurnishingStepValues;
  setFrStepValues: (values: FurnishingStepValues) => void;
  fmStepValues: FacilityManagementStepValues;
  setFmStepValues: (values: FacilityManagementStepValues) => void;
  gsStepValues: GovernmentServicesStepValues;
  setGsStepValues: (values: GovernmentServicesStepValues) => void;
  redStepValues: RealEstateDevelopmentStepValues;
  setRedStepValues: (values: RealEstateDevelopmentStepValues) => void;
  rmStepValues: RealEstateMarketingStepValues;
  setRmStepValues: (values: RealEstateMarketingStepValues) => void;
  bmStepValues: BuildingMaterialsStepValues;
  setBmStepValues: (values: BuildingMaterialsStepValues) => void;
  eqStepValues: EquipmentStepValues;
  setEqStepValues: (values: EquipmentStepValues) => void;
  fieldErrors: FieldValidationErrorDetail[];
  formError: string | null;
  sendMessage: (message: string) => Promise<void>;
  startBuildVillaFromQuickAction: () => Promise<void>;
  advanceCurrentStep: () => Promise<void>;
  revisitCurrentSection: (targetStep: string) => Promise<void>;
  completeCurrentJourney: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const emptyCtStepValues = (): ContractingStepValues => ({
  projectType: '',
  projectDescription: '',
  currentStage: '',
  location: '',
  designReadiness: '',
  boqReadiness: '',
  siteReadiness: '',
  scopeType: '',
  procurementGoal: '',
  desiredStart: '',
  urgency: '',
  budgetRange: '',
  requirementsNotes: '',
  experienceType: '',
  drawingsAvailable: null,
  boqAvailable: null,
  permitsAvailable: null,
  sitePhotosAvailable: null,
  documentNotes: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

const emptyRvStepValues = (): ValuationStepValues => ({
  valuationPurpose: '',
  assetType: '',
  location: '',
  assetDescription: '',
  areaSqm: '',
  ownershipStatus: '',
  deedAvailable: null,
  titleDocsAvailable: null,
  rentRollAvailable: null,
  plansAvailable: null,
  documentNotes: '',
  inspectionReadiness: '',
  desiredTimeline: '',
  urgency: '',
  engagementGoal: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

const emptyFrStepValues = (): FurnishingStepValues => ({
  spaceType: '',
  projectStage: '',
  furnishingGoal: '',
  styleDirection: '',
  functionalPriorities: '',
  roomScope: '',
  budgetRange: '',
  targetTimeline: '',
  urgency: '',
  procurementPreference: '',
  currentReadiness: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

const emptyFmStepValues = (): FacilityManagementStepValues => ({
  facilityType: '',
  location: '',
  facilityScope: '',
  operationalChallenge: '',
  serviceMaturity: '',
  engagementGoal: '',
  targetTimeline: '',
  urgency: '',
  currentReadiness: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

const emptyGsStepValues = (): GovernmentServicesStepValues => ({
  serviceCategory: '',
  propertyLocation: '',
  propertyType: '',
  requestSummary: '',
  documentsStatus: '',
  urgency: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

const emptyRedStepValues = (): RealEstateDevelopmentStepValues => ({
  assetContext: '',
  assetLocation: '',
  developmentObjective: '',
  intendedUse: '',
  currentStatus: '',
  knownConstraints: '',
  documentsReadiness: '',
  targetTimeline: '',
  urgency: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

const emptyRmStepValues = (): RealEstateMarketingStepValues => ({
  marketingGoal: '',
  propertyDescription: '',
  propertyLocation: '',
  targetAudience: '',
  marketingStage: '',
  existingAssets: '',
  channelsInterest: '',
  targetTimeline: '',
  urgency: '',
  budgetContext: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

const emptyBmStepValues = (): BuildingMaterialsStepValues => ({
  procurementGoal: '',
  materialCategory: '',
  projectContext: '',
  deliveryLocation: '',
  quantityScope: '',
  specificationsContext: '',
  targetTimeline: '',
  urgency: '',
  budgetContext: '',
  supplierContext: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

const emptyEqStepValues = (): EquipmentStepValues => ({
  equipmentNeed: '',
  equipmentCategory: '',
  usageContext: '',
  location: '',
  engagementType: '',
  specificationsContext: '',
  targetTimeline: '',
  urgency: '',
  budgetContext: '',
  readinessContext: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

const emptyPmStepValues = (): ProjectManagementStepValues => ({
  projectType: '',
  projectStage: '',
  projectObjective: '',
  currentStatus: '',
  scopeClarity: '',
  desiredTimeline: '',
  urgency: '',
  budgetState: '',
  mainChallenges: '',
  topRisks: '',
  stakeholderNotes: '',
  engagementGoal: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

const emptySmStepValues = (): MaintenanceStepValues => ({
  maintenanceCategory: '',
  location: '',
  issueDescription: '',
  severityLevel: '',
  accessReadiness: '',
  systemNotes: '',
  priorMaintenance: null,
  serviceNotes: '',
  engagementGoal: '',
  desiredTimeline: '',
  urgency: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

const emptyEcStepValues = (): EngineeringStepValues => ({
  problemStatement: '',
  desiredOutcome: '',
  discipline: '',
  projectType: '',
  location: '',
  objective: '',
  currentStage: '',
  urgency: '',
  hasDocuments: null,
  documentNotes: '',
  scopeConfirmed: false,
});

function createMessage(role: WorkspaceMessage['role'], content: string): WorkspaceMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}

function syncCtStepValuesFromContext(context: ContractingContext): ContractingStepValues {
  return {
    projectType: context.project_type ?? '',
    projectDescription: context.project_description ?? '',
    currentStage: context.current_stage ?? '',
    location: context.location ?? '',
    designReadiness: context.design_readiness ?? '',
    boqReadiness: context.boq_readiness ?? '',
    siteReadiness: context.site_readiness ?? '',
    scopeType: context.scope_type ?? '',
    procurementGoal: context.procurement_goal ?? '',
    desiredStart: context.desired_start ?? '',
    urgency: context.urgency ?? '',
    budgetRange: context.budget_range ?? '',
    requirementsNotes: context.requirements_notes ?? '',
    experienceType: context.experience_type ?? '',
    drawingsAvailable: context.drawings_available ?? null,
    boqAvailable: context.boq_available ?? null,
    permitsAvailable: context.permits_available ?? null,
    sitePhotosAvailable: context.site_photos_available ?? null,
    documentNotes: context.document_notes ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}

function syncRvStepValuesFromContext(context: RealEstateValuationContext): ValuationStepValues {
  return {
    valuationPurpose: context.valuation_purpose ?? '',
    assetType: context.asset_type ?? '',
    location: context.location ?? '',
    assetDescription: context.asset_description ?? '',
    areaSqm: context.area_sqm != null ? String(context.area_sqm) : '',
    ownershipStatus: context.ownership_status ?? '',
    deedAvailable: context.deed_available ?? null,
    titleDocsAvailable: context.title_docs_available ?? null,
    rentRollAvailable: context.rent_roll_available ?? null,
    plansAvailable: context.plans_available ?? null,
    documentNotes: context.document_notes ?? '',
    inspectionReadiness: context.inspection_readiness ?? '',
    desiredTimeline: context.desired_timeline ?? '',
    urgency: context.urgency ?? '',
    engagementGoal: context.engagement_goal ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}

function syncFrStepValuesFromContext(context: FurnishingContext): FurnishingStepValues {
  return {
    spaceType: context.space_type ?? '',
    projectStage: context.project_stage ?? '',
    furnishingGoal: context.furnishing_goal ?? '',
    styleDirection: context.style_direction ?? '',
    functionalPriorities: context.functional_priorities ?? '',
    roomScope: context.room_scope ?? '',
    budgetRange: context.budget_range ?? '',
    targetTimeline: context.target_timeline ?? '',
    urgency: context.urgency ?? '',
    procurementPreference: context.procurement_preference ?? '',
    currentReadiness: context.current_readiness ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}

function syncFmStepValuesFromContext(context: FacilityManagementContext): FacilityManagementStepValues {
  return {
    facilityType: context.facility_type ?? '',
    location: context.location ?? '',
    facilityScope: context.facility_scope ?? '',
    operationalChallenge: context.operational_challenge ?? '',
    serviceMaturity: context.service_maturity ?? '',
    engagementGoal: context.engagement_goal ?? '',
    targetTimeline: context.target_timeline ?? '',
    urgency: context.urgency ?? '',
    currentReadiness: context.current_readiness ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}

function syncGsStepValuesFromContext(context: GovernmentServicesContext): GovernmentServicesStepValues {
  return {
    serviceCategory: context.service_category ?? '',
    propertyLocation: context.property_location ?? '',
    propertyType: context.property_type ?? '',
    requestSummary: context.request_summary ?? '',
    documentsStatus: context.documents_status ?? '',
    urgency: context.urgency ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}

function syncRedStepValuesFromContext(
  context: RealEstateDevelopmentContext,
): RealEstateDevelopmentStepValues {
  return {
    assetContext: context.asset_context ?? '',
    assetLocation: context.asset_location ?? '',
    developmentObjective: context.development_objective ?? '',
    intendedUse: context.intended_use ?? '',
    currentStatus: context.current_status ?? '',
    knownConstraints: context.known_constraints ?? '',
    documentsReadiness: context.documents_readiness ?? '',
    targetTimeline: context.target_timeline ?? '',
    urgency: context.urgency ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}

function syncRmStepValuesFromContext(
  context: RealEstateMarketingContext,
): RealEstateMarketingStepValues {
  return {
    marketingGoal: context.marketing_goal ?? '',
    propertyDescription: context.property_description ?? '',
    propertyLocation: context.property_location ?? '',
    targetAudience: context.target_audience ?? '',
    marketingStage: context.marketing_stage ?? '',
    existingAssets: context.existing_assets ?? '',
    channelsInterest: context.channels_interest ?? '',
    targetTimeline: context.target_timeline ?? '',
    urgency: context.urgency ?? '',
    budgetContext: context.budget_context ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}

function syncBmStepValuesFromContext(
  context: BuildingMaterialsContext,
): BuildingMaterialsStepValues {
  return {
    procurementGoal: context.procurement_goal ?? '',
    materialCategory: context.material_category ?? '',
    projectContext: context.project_context ?? '',
    deliveryLocation: context.delivery_location ?? '',
    quantityScope: context.quantity_scope ?? '',
    specificationsContext: context.specifications_context ?? '',
    targetTimeline: context.target_timeline ?? '',
    urgency: context.urgency ?? '',
    budgetContext: context.budget_context ?? '',
    supplierContext: context.supplier_context ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}

function syncEqStepValuesFromContext(context: EquipmentContext): EquipmentStepValues {
  return {
    equipmentNeed: context.equipment_need ?? '',
    equipmentCategory: context.equipment_category ?? '',
    usageContext: context.usage_context ?? '',
    location: context.location ?? '',
    engagementType: context.engagement_type ?? '',
    specificationsContext: context.specifications_context ?? '',
    targetTimeline: context.target_timeline ?? '',
    urgency: context.urgency ?? '',
    budgetContext: context.budget_context ?? '',
    readinessContext: context.readiness_context ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}

function syncPmStepValuesFromContext(context: ProjectManagementContext): ProjectManagementStepValues {
  return {
    projectType: context.project_type ?? '',
    projectStage: context.project_stage ?? '',
    projectObjective: context.project_objective ?? '',
    currentStatus: context.current_status ?? '',
    scopeClarity: context.scope_clarity ?? '',
    desiredTimeline: context.desired_timeline ?? '',
    urgency: context.urgency ?? '',
    budgetState: context.budget_state ?? '',
    mainChallenges: context.main_challenges ?? '',
    topRisks: context.top_risks ?? '',
    stakeholderNotes: context.stakeholder_notes ?? '',
    engagementGoal: context.engagement_goal ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}

function syncSmStepValuesFromContext(context: SmartMaintenanceContext): MaintenanceStepValues {
  return {
    maintenanceCategory: context.maintenance_category ?? '',
    location: context.location ?? '',
    issueDescription: context.issue_description ?? '',
    severityLevel: context.severity_level ?? '',
    accessReadiness: context.access_readiness ?? '',
    systemNotes: context.system_notes ?? '',
    priorMaintenance: context.prior_maintenance ?? null,
    serviceNotes: context.service_notes ?? '',
    engagementGoal: context.engagement_goal ?? '',
    desiredTimeline: context.desired_timeline ?? '',
    urgency: context.urgency ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
    submitConfirmed: context.submit_confirmed ?? false,
  };
}

function syncEcStepValuesFromContext(context: EngineeringConsultingContext): EngineeringStepValues {
  return {
    problemStatement: context.problem_statement ?? '',
    desiredOutcome: context.desired_outcome ?? '',
    discipline: context.discipline ?? '',
    projectType: context.project_type ?? '',
    location: context.location ?? '',
    objective: context.objective ?? '',
    currentStage: context.current_stage ?? '',
    urgency: context.urgency ?? '',
    hasDocuments: context.has_documents ?? null,
    documentNotes: context.document_notes ?? '',
    scopeConfirmed: context.scope_confirmed ?? false,
  };
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    currentInstance,
    startJourney,
    advance,
    revisit,
    complete,
    recordEvent,
    getInstance,
  } = useJourney();

  const [mode, setMode] = useState<WorkspaceMode>('chat');
  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [completionNotice, setCompletionNotice] = useState<CompletionNotice | null>(null);
  const [stepValues, setStepValues] = useState<BuildVillaStepValues>(emptyBvStepValues);
  const [ecStepValues, setEcStepValues] = useState<EngineeringStepValues>(emptyEcStepValues);
  const [ctStepValues, setCtStepValues] = useState<ContractingStepValues>(emptyCtStepValues);
  const [rvStepValues, setRvStepValues] = useState<ValuationStepValues>(emptyRvStepValues);
  const [smStepValues, setSmStepValues] = useState<MaintenanceStepValues>(emptySmStepValues);
  const [pmStepValues, setPmStepValues] = useState<ProjectManagementStepValues>(emptyPmStepValues);
  const [frStepValues, setFrStepValues] = useState<FurnishingStepValues>(emptyFrStepValues);
  const [fmStepValues, setFmStepValues] = useState<FacilityManagementStepValues>(emptyFmStepValues);
  const [gsStepValues, setGsStepValues] = useState<GovernmentServicesStepValues>(emptyGsStepValues);
  const [redStepValues, setRedStepValues] = useState<RealEstateDevelopmentStepValues>(emptyRedStepValues);
  const [rmStepValues, setRmStepValues] = useState<RealEstateMarketingStepValues>(emptyRmStepValues);
  const [bmStepValues, setBmStepValues] = useState<BuildingMaterialsStepValues>(emptyBmStepValues);
  const [eqStepValues, setEqStepValues] = useState<EquipmentStepValues>(emptyEqStepValues);
  const [fieldErrors, setFieldErrors] = useState<FieldValidationErrorDetail[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

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

  const isJourneyActive =
    currentInstance != null &&
    SUPPORTED_JOURNEY_TYPES.has(currentInstance.journey_type) &&
    (currentInstance.status === 'active' || currentInstance.status === 'paused');

  useEffect(() => {
    if (!currentInstance || !SUPPORTED_JOURNEY_TYPES.has(currentInstance.journey_type)) {
      return;
    }

    if (currentInstance.journey_type === BUILD_VILLA_JOURNEY_TYPE) {
      setStepValues(syncBvStepValuesFromContext(bvContext as Record<string, unknown>));
    }
    if (currentInstance.journey_type === ENGINEERING_CONSULTING_JOURNEY_TYPE) {
      setEcStepValues(syncEcStepValuesFromContext(ecContext));
    }
    if (currentInstance.journey_type === CONTRACTING_JOURNEY_TYPE) {
      setCtStepValues(syncCtStepValuesFromContext(ctContext));
    }
    if (currentInstance.journey_type === REAL_ESTATE_VALUATION_JOURNEY_TYPE) {
      setRvStepValues(syncRvStepValuesFromContext(rvContext));
    }
    if (currentInstance.journey_type === SMART_MAINTENANCE_JOURNEY_TYPE) {
      setSmStepValues(syncSmStepValuesFromContext(smContext));
    }
    if (currentInstance.journey_type === PROJECT_MANAGEMENT_JOURNEY_TYPE) {
      setPmStepValues(syncPmStepValuesFromContext(pmContext));
    }
    if (currentInstance.journey_type === FURNISHING_JOURNEY_TYPE) {
      setFrStepValues(syncFrStepValuesFromContext(frContext));
    }
    if (currentInstance.journey_type === FACILITY_MANAGEMENT_JOURNEY_TYPE) {
      setFmStepValues(syncFmStepValuesFromContext(fmContext));
    }
    if (currentInstance.journey_type === GOVERNMENT_SERVICES_JOURNEY_TYPE) {
      setGsStepValues(syncGsStepValuesFromContext(gsContext));
    }
    if (currentInstance.journey_type === REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE) {
      setRedStepValues(syncRedStepValuesFromContext(redContext));
    }
    if (currentInstance.journey_type === REAL_ESTATE_MARKETING_JOURNEY_TYPE) {
      setRmStepValues(syncRmStepValuesFromContext(rmContext));
    }
    if (currentInstance.journey_type === BUILDING_MATERIALS_JOURNEY_TYPE) {
      setBmStepValues(syncBmStepValuesFromContext(bmContext));
    }
    if (currentInstance.journey_type === EQUIPMENT_JOURNEY_TYPE) {
      setEqStepValues(syncEqStepValuesFromContext(eqContext));
    }

    if (currentInstance.status === 'active' || currentInstance.status === 'paused') {
      setMode('journey');
    }
    if (currentInstance.status === 'completed') {
      setMode('chat');
    }
  }, [currentInstance, bvContext, ecContext, ctContext, rvContext, smContext, pmContext, frContext, fmContext, gsContext, redContext, rmContext, bmContext, eqContext]);

  const handoffToJourney = useCallback(
    async (
      journeyType: string,
      assistantMessage: string,
      source: 'quick_action' | 'free_text',
      traceId?: string | null,
    ) => {
      const actionResult = await executeStartJourney(journeyType, traceId);
      let instance;

      if (actionResult.status === 'success' && actionResult.journeyInstanceId) {
        instance = await getInstance(actionResult.journeyInstanceId);
      } else if (actionResult.viaToolGateway && actionResult.status === 'denied') {
        throw new Error(actionResult.safeMessage ?? actionFailureMessage(actionResult.errorCode));
      } else {
        try {
          instance = await startJourney({
            journey_type: journeyType,
            initial_context: { source_channel: 'hero_workspace', handoff_source: source },
          });
        } catch (error) {
          const existingId = extractExistingInstanceId(error);
          if (!existingId) {
            throw error;
          }
          instance = await getInstance(existingId);
        }
      }

      setActiveJourneyInstanceId(instance.id);
      await recordEvent(instance.id, {
        event_type: 'ai_handoff',
        payload: {
          source,
          journey_type: journeyType,
          via_tool_gateway: actionResult.viaToolGateway === true,
          trace_id: actionResult.traceId ?? traceId,
        },
      });
      setMessages((prev) => [...prev, createMessage('assistant', assistantMessage)]);
      setMode('journey');
      setWorkspaceError(null);
      await getInstance(instance.id);
    },
    [getInstance, recordEvent, startJourney],
  );

  const startBuildVillaFromQuickAction = useCallback(async () => {
    if (isBusy || isJourneyActive) {
      return;
    }
    setIsBusy(true);
    setWorkspaceError(null);
    setStreamingContent('');
    setMessages((prev) => [...prev, createMessage('user', BUILD_VILLA_QUICK_ACTION_LABEL)]);

    try {
      await handoffToJourney(
        BUILD_VILLA_JOURNEY_TYPE,
        'رائع! سأساعدك في بدء رحلة جمع معلومات بناء الفيلا. لنبدأ بفهم هدف مشروعك أولاً.',
        'quick_action',
      );
    } catch (error) {
      console.error(error);
      setWorkspaceError('تعذر بدء رحلة بناء الفيلا. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsBusy(false);
    }
  }, [handoffToJourney, isBusy, isJourneyActive]);

  const sendMessage = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || isBusy) {
        return;
      }

      if (isJourneyActive) {
        return;
      }

      setIsBusy(true);
      setWorkspaceError(null);
      setStreamingContent('');
      setMessages((prev) => [...prev, createMessage('user', trimmed)]);

      try {
        const turn = await aiCoreClient.workspaceTurn({ message: trimmed, stream: true });

        const startAction = turn.actions?.find(
          (proposal) =>
            proposal.action === 'START_JOURNEY' &&
            proposal.journey_type &&
            SUPPORTED_JOURNEY_TYPES.has(proposal.journey_type),
        );

        const executableAction = turn.actions?.find((proposal) =>
          ['START_JOURNEY', 'REQUEST_HUMAN_HANDOFF'].includes(proposal.action),
        );

        if (executableAction?.action === 'REQUEST_HUMAN_HANDOFF') {
          const handoffResult = await executeActionProposal(executableAction, turn.trace_id);
          setMessages((prev) => [
            ...prev,
            createMessage('assistant', handoffResult.safeMessage ?? turn.assistant_message),
          ]);
          return;
        }

        if (startAction?.journey_type) {
          await handoffToJourney(
            startAction.journey_type,
            turn.assistant_message,
            'free_text',
            turn.trace_id,
          );
          return;
        }

        if (
          turn.action === 'start_journey' &&
          turn.journey_type &&
          SUPPORTED_JOURNEY_TYPES.has(turn.journey_type)
        ) {
          await handoffToJourney(turn.journey_type, turn.assistant_message, 'free_text', turn.trace_id);
          return;
        }

        if (turn.action === 'ai_unavailable') {
          setMessages((prev) => [...prev, createMessage('assistant', turn.assistant_message)]);
          setWorkspaceError(turn.assistant_message);
          return;
        }

        if (turn.action === 'general_answer') {
          if (turn.stream) {
            let streamed = '';
            streamed = await aiCoreClient.streamGeneralAnswer({ message: trimmed }, (content) => {
              setStreamingContent(content);
            });
            setStreamingContent('');
            setMessages((prev) => [...prev, createMessage('assistant', streamed || turn.assistant_message)]);
          } else {
            setMessages((prev) => [...prev, createMessage('assistant', turn.assistant_message)]);
          }
          return;
        }

        setMessages((prev) => [...prev, createMessage('assistant', turn.assistant_message)]);
      } catch (error) {
        console.error(error);
        const failure =
          'تعذر معالجة رسالتك حالياً. يمكنك استخدام «أبني منزلًا» أو وصف احتياجك الهندسي لبدء رحلة مناسبة.';
        setWorkspaceError(failure);
        setMessages((prev) => [...prev, createMessage('assistant', failure)]);
      } finally {
        setIsBusy(false);
        setStreamingContent('');
      }
    },
    [handoffToJourney, isBusy, isJourneyActive],
  );

  const advanceCurrentStep = useCallback(async () => {
    if (!currentInstance || isBusy) {
      return;
    }

    setIsBusy(true);
    setFieldErrors([]);
    setFormError(null);

    let input: Record<string, unknown>;
    if (currentInstance.journey_type === ENGINEERING_CONSULTING_JOURNEY_TYPE) {
      input = buildEcAdvanceInput(currentInstance.current_step_key, ecStepValues);
    } else if (currentInstance.journey_type === CONTRACTING_JOURNEY_TYPE) {
      input = buildCtAdvanceInput(currentInstance.current_step_key, ctStepValues);
    } else if (currentInstance.journey_type === REAL_ESTATE_VALUATION_JOURNEY_TYPE) {
      input = buildRvAdvanceInput(currentInstance.current_step_key, rvStepValues);
    } else if (currentInstance.journey_type === SMART_MAINTENANCE_JOURNEY_TYPE) {
      input = buildSmAdvanceInput(currentInstance.current_step_key, smStepValues);
    } else if (currentInstance.journey_type === PROJECT_MANAGEMENT_JOURNEY_TYPE) {
      input = buildPmAdvanceInput(currentInstance.current_step_key, pmStepValues);
    } else if (currentInstance.journey_type === FURNISHING_JOURNEY_TYPE) {
      input = buildFrAdvanceInput(currentInstance.current_step_key, frStepValues);
    } else if (currentInstance.journey_type === FACILITY_MANAGEMENT_JOURNEY_TYPE) {
      input = buildFmAdvanceInput(currentInstance.current_step_key, fmStepValues);
    } else if (currentInstance.journey_type === GOVERNMENT_SERVICES_JOURNEY_TYPE) {
      input = buildGsAdvanceInput(currentInstance.current_step_key, gsStepValues);
    } else if (currentInstance.journey_type === REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE) {
      input = buildRedAdvanceInput(currentInstance.current_step_key, redStepValues);
    } else if (currentInstance.journey_type === REAL_ESTATE_MARKETING_JOURNEY_TYPE) {
      input = buildRmAdvanceInput(currentInstance.current_step_key, rmStepValues);
    } else if (currentInstance.journey_type === BUILDING_MATERIALS_JOURNEY_TYPE) {
      input = buildBmAdvanceInput(currentInstance.current_step_key, bmStepValues);
    } else if (currentInstance.journey_type === EQUIPMENT_JOURNEY_TYPE) {
      input = buildEqAdvanceInput(currentInstance.current_step_key, eqStepValues);
    } else {
      input = buildBvAdvanceInput(currentInstance.current_step_key, stepValues);
    }

    try {
      await advance(currentInstance.id, { input });
    } catch (error) {
      let errors = extractBvFieldErrors(error);
      let message = getBvErrorMessage(errors, 'تعذر إرسال هذه الخطوة. يرجى مراجعة البيانات.');
      if (currentInstance.journey_type === ENGINEERING_CONSULTING_JOURNEY_TYPE) {
        errors = extractEcFieldErrors(error);
        message = getEcErrorMessage(errors, message);
      } else if (currentInstance.journey_type === CONTRACTING_JOURNEY_TYPE) {
        errors = extractCtFieldErrors(error);
        message = getCtErrorMessage(errors, message);
      } else if (currentInstance.journey_type === REAL_ESTATE_VALUATION_JOURNEY_TYPE) {
        errors = extractRvFieldErrors(error);
        message = getRvErrorMessage(errors, message);
      } else if (currentInstance.journey_type === SMART_MAINTENANCE_JOURNEY_TYPE) {
        errors = extractSmFieldErrors(error);
        message = getSmErrorMessage(errors, message);
      } else if (currentInstance.journey_type === PROJECT_MANAGEMENT_JOURNEY_TYPE) {
        errors = extractPmFieldErrors(error);
        message = getPmErrorMessage(errors, message);
      } else if (currentInstance.journey_type === FURNISHING_JOURNEY_TYPE) {
        errors = extractFrFieldErrors(error);
        message = getFrErrorMessage(errors, message);
      } else if (currentInstance.journey_type === FACILITY_MANAGEMENT_JOURNEY_TYPE) {
        errors = extractFmFieldErrors(error);
        message = getFmErrorMessage(errors, message);
      } else if (currentInstance.journey_type === GOVERNMENT_SERVICES_JOURNEY_TYPE) {
        errors = extractGsFieldErrors(error);
        message = getGsErrorMessage(errors, message);
      } else if (currentInstance.journey_type === REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE) {
        errors = extractRedFieldErrors(error);
        message = getRedErrorMessage(errors, message);
      } else if (currentInstance.journey_type === REAL_ESTATE_MARKETING_JOURNEY_TYPE) {
        errors = extractRmFieldErrors(error);
        message = getRmErrorMessage(errors, message);
      } else if (currentInstance.journey_type === BUILDING_MATERIALS_JOURNEY_TYPE) {
        errors = extractBmFieldErrors(error);
        message = getBmErrorMessage(errors, message);
      } else if (currentInstance.journey_type === EQUIPMENT_JOURNEY_TYPE) {
        errors = extractEqFieldErrors(error);
        message = getEqErrorMessage(errors, message);
      }
      setFieldErrors(errors);
      setFormError(message);
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  }, [advance, currentInstance, ctStepValues, ecStepValues, fmStepValues, frStepValues, gsStepValues, redStepValues, rmStepValues, bmStepValues, eqStepValues, isBusy, pmStepValues, rvStepValues, smStepValues, stepValues]);

  const revisitCurrentSection = useCallback(
    async (targetStep: string) => {
      if (!currentInstance || currentInstance.journey_type !== BUILD_VILLA_JOURNEY_TYPE || isBusy) {
        return;
      }
      setIsBusy(true);
      setFormError(null);
      setFieldErrors([]);
      try {
        await revisit(currentInstance.id, targetStep);
      } catch (error) {
        setFormError('تعذر العودة لتعديل هذا القسم.');
        console.error(error);
      } finally {
        setIsBusy(false);
      }
    },
    [currentInstance, isBusy, revisit],
  );

  const completeCurrentJourney = useCallback(async () => {
    if (!currentInstance || isBusy) {
      return;
    }
    setIsBusy(true);
    setFormError(null);
    try {
      const instance = await complete(currentInstance.id);
      setMode('chat');
      if (user && instance.service_request_id) {
        setCompletionNotice({
          kind: 'authenticated',
          serviceRequestId: instance.service_request_id,
        });
        await queryClient.invalidateQueries({ queryKey: ['service-requests'] });
        setMessages((prev) => [...prev, createMessage('assistant', 'تم استلام طلبك.')]);
      } else {
        setCompletionNotice({ kind: 'anonymous' });
        setMessages((prev) => [
          ...prev,
          createMessage(
            'assistant',
            'تم إكمال رحلة جمع المعلومات. سجّل الدخول للوصول إلى طلبك في مساحة العميل.',
          ),
        ]);
      }
    } catch (error) {
      setFormError('تعذر إنهاء الرحلة. يرجى المحاولة مرة أخرى.');
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  }, [complete, currentInstance, isBusy, queryClient, user]);

  const value = useMemo(
    () => ({
      mode,
      messages,
      streamingContent,
      isBusy,
      workspaceError,
      currentInstance,
      completionNotice,
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
      startBuildVillaFromQuickAction,
      advanceCurrentStep,
      revisitCurrentSection,
      completeCurrentJourney,
    }),
    [
      mode,
      messages,
      streamingContent,
      isBusy,
      workspaceError,
      currentInstance,
      completionNotice,
      stepValues,
      ecStepValues,
      ctStepValues,
      rvStepValues,
      smStepValues,
      pmStepValues,
      frStepValues,
      fmStepValues,
      gsStepValues,
      redStepValues,
      rmStepValues,
      bmStepValues,
      eqStepValues,
      fieldErrors,
      formError,
      sendMessage,
      startBuildVillaFromQuickAction,
      advanceCurrentStep,
      revisitCurrentSection,
      completeCurrentJourney,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

export { BUILD_VILLA_QUICK_ACTION_LABEL, BUILD_VILLA_INTENT_HINT };
