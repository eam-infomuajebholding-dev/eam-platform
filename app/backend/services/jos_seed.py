import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.journey_definitions import JourneyDefinition
from services.jos_validators import validate_workflow_definition

logger = logging.getLogger(__name__)

GENERIC_DEMO_WORKFLOW = {
    "initial_step": "start",
    "steps": [
        {
            "key": "start",
            "label": "Journey start",
            "required_fields": [],
            "next": "collect_context",
        },
        {
            "key": "collect_context",
            "label": "Generic context collection",
            "required_fields": ["note"],
            "next": "ready",
        },
        {
            "key": "ready",
            "label": "Ready for downstream activation",
            "terminal": True,
        },
    ],
}

ENGINEERING_CONSULTING_WORKFLOW = {
    "initial_step": "intent",
    "steps": [
        {
            "key": "intent",
            "label": "Intent",
            "required_fields": ["problem_statement"],
            "next": "discipline",
        },
        {
            "key": "discipline",
            "label": "Discipline",
            "required_fields": ["discipline"],
            "next": "qualification",
        },
        {
            "key": "qualification",
            "label": "Qualification",
            "required_fields": ["project_type", "location", "objective"],
            "next": "documents",
        },
        {
            "key": "documents",
            "label": "Documents",
            "required_fields": [],
            "next": "brief_review",
        },
        {
            "key": "brief_review",
            "label": "Preliminary brief review",
            "required_fields": [],
            "next": "scope_confirm",
        },
        {
            "key": "scope_confirm",
            "label": "Scope confirmation",
            "required_fields": ["scope_confirmed"],
            "next": "handoff_complete",
        },
        {
            "key": "handoff_complete",
            "label": "Handoff complete",
            "terminal": True,
        },
    ],
}

CONTRACTING_WORKFLOW = {
    "initial_step": "project_context",
    "steps": [
        {
            "key": "project_context",
            "label": "Project context",
            "required_fields": ["project_type", "project_description", "current_stage"],
            "next": "project_location",
        },
        {
            "key": "project_location",
            "label": "Project location",
            "required_fields": ["location"],
            "next": "design_readiness",
        },
        {
            "key": "design_readiness",
            "label": "Design readiness",
            "required_fields": ["design_readiness"],
            "next": "boq_readiness",
        },
        {
            "key": "boq_readiness",
            "label": "BOQ readiness",
            "required_fields": ["boq_readiness"],
            "next": "site_readiness",
        },
        {
            "key": "site_readiness",
            "label": "Site readiness",
            "required_fields": ["site_readiness"],
            "next": "scope_type",
        },
        {
            "key": "scope_type",
            "label": "Scope type",
            "required_fields": ["scope_type"],
            "next": "procurement_goal",
        },
        {
            "key": "procurement_goal",
            "label": "Procurement goal",
            "required_fields": ["procurement_goal"],
            "next": "timeline_context",
        },
        {
            "key": "timeline_context",
            "label": "Timeline context",
            "required_fields": ["desired_start"],
            "next": "budget_context",
        },
        {
            "key": "budget_context",
            "label": "Budget context",
            "required_fields": ["budget_range"],
            "next": "contractor_requirements",
        },
        {
            "key": "contractor_requirements",
            "label": "Contractor requirements",
            "required_fields": [],
            "next": "documents_context",
        },
        {
            "key": "documents_context",
            "label": "Documents context",
            "required_fields": [],
            "next": "summary_review",
        },
        {
            "key": "summary_review",
            "label": "Summary review",
            "required_fields": [],
            "next": "readiness_brief",
        },
        {
            "key": "readiness_brief",
            "label": "Readiness brief review",
            "required_fields": [],
            "next": "scope_confirm",
        },
        {
            "key": "scope_confirm",
            "label": "Scope confirmation",
            "required_fields": ["scope_confirmed"],
            "next": "submit_confirm",
        },
        {
            "key": "submit_confirm",
            "label": "Submit confirmation",
            "required_fields": ["submit_confirmed"],
            "next": "intake_complete",
        },
        {
            "key": "intake_complete",
            "label": "Intake complete",
            "terminal": True,
        },
    ],
}

SMART_MAINTENANCE_WORKFLOW = {
    "initial_step": "maintenance_category",
    "steps": [
        {
            "key": "maintenance_category",
            "label": "Maintenance category",
            "required_fields": ["maintenance_category"],
            "next": "asset_location",
        },
        {
            "key": "asset_location",
            "label": "Asset location",
            "required_fields": ["location"],
            "next": "issue_description",
        },
        {
            "key": "issue_description",
            "label": "Issue description",
            "required_fields": ["issue_description"],
            "next": "severity_level",
        },
        {
            "key": "severity_level",
            "label": "Severity level",
            "required_fields": ["severity_level"],
            "next": "access_readiness",
        },
        {
            "key": "access_readiness",
            "label": "Access readiness",
            "required_fields": ["access_readiness"],
            "next": "system_context",
        },
        {
            "key": "system_context",
            "label": "System context",
            "required_fields": [],
            "next": "prior_service_context",
        },
        {
            "key": "prior_service_context",
            "label": "Prior service context",
            "required_fields": [],
            "next": "engagement_goal",
        },
        {
            "key": "engagement_goal",
            "label": "Engagement goal",
            "required_fields": ["engagement_goal"],
            "next": "timeline_context",
        },
        {
            "key": "timeline_context",
            "label": "Timeline context",
            "required_fields": ["desired_timeline"],
            "next": "summary_review",
        },
        {
            "key": "summary_review",
            "label": "Summary review",
            "required_fields": [],
            "next": "readiness_brief",
        },
        {
            "key": "readiness_brief",
            "label": "Readiness brief review",
            "required_fields": [],
            "next": "scope_confirm",
        },
        {
            "key": "scope_confirm",
            "label": "Scope confirmation",
            "required_fields": ["scope_confirmed"],
            "next": "submit_confirm",
        },
        {
            "key": "submit_confirm",
            "label": "Submit confirmation",
            "required_fields": ["submit_confirmed"],
            "next": "intake_complete",
        },
        {
            "key": "intake_complete",
            "label": "Intake complete",
            "terminal": True,
        },
    ],
}

PROJECT_MANAGEMENT_WORKFLOW = {
    "initial_step": "project_type",
    "steps": [
        {
            "key": "project_type",
            "label": "Project type",
            "required_fields": ["project_type"],
            "next": "project_stage",
        },
        {
            "key": "project_stage",
            "label": "Project stage",
            "required_fields": ["project_stage"],
            "next": "project_context",
        },
        {
            "key": "project_context",
            "label": "Project context",
            "required_fields": ["project_objective", "current_status"],
            "next": "scope_clarity",
        },
        {
            "key": "scope_clarity",
            "label": "Scope clarity",
            "required_fields": ["scope_clarity"],
            "next": "timeline_context",
        },
        {
            "key": "timeline_context",
            "label": "Timeline context",
            "required_fields": ["desired_timeline"],
            "next": "budget_context",
        },
        {
            "key": "budget_context",
            "label": "Budget context",
            "required_fields": ["budget_state"],
            "next": "challenges_context",
        },
        {
            "key": "challenges_context",
            "label": "Challenges context",
            "required_fields": ["main_challenges"],
            "next": "stakeholder_context",
        },
        {
            "key": "stakeholder_context",
            "label": "Stakeholder context",
            "required_fields": [],
            "next": "engagement_goal",
        },
        {
            "key": "engagement_goal",
            "label": "Engagement goal",
            "required_fields": ["engagement_goal"],
            "next": "summary_review",
        },
        {
            "key": "summary_review",
            "label": "Summary review",
            "required_fields": [],
            "next": "readiness_brief",
        },
        {
            "key": "readiness_brief",
            "label": "Readiness brief review",
            "required_fields": [],
            "next": "scope_confirm",
        },
        {
            "key": "scope_confirm",
            "label": "Scope confirmation",
            "required_fields": ["scope_confirmed"],
            "next": "submit_confirm",
        },
        {
            "key": "submit_confirm",
            "label": "Submit confirmation",
            "required_fields": ["submit_confirmed"],
            "next": "intake_complete",
        },
        {
            "key": "intake_complete",
            "label": "Intake complete",
            "terminal": True,
        },
    ],
}

REAL_ESTATE_VALUATION_WORKFLOW = {
    "initial_step": "valuation_purpose",
    "steps": [
        {
            "key": "valuation_purpose",
            "label": "Valuation purpose",
            "required_fields": ["valuation_purpose"],
            "next": "asset_type",
        },
        {
            "key": "asset_type",
            "label": "Asset type",
            "required_fields": ["asset_type"],
            "next": "asset_location",
        },
        {
            "key": "asset_location",
            "label": "Asset location",
            "required_fields": ["location"],
            "next": "asset_description",
        },
        {
            "key": "asset_description",
            "label": "Asset description",
            "required_fields": ["asset_description"],
            "next": "ownership_context",
        },
        {
            "key": "ownership_context",
            "label": "Ownership context",
            "required_fields": ["ownership_status"],
            "next": "document_readiness",
        },
        {
            "key": "document_readiness",
            "label": "Document readiness",
            "required_fields": [],
            "next": "inspection_readiness",
        },
        {
            "key": "inspection_readiness",
            "label": "Inspection readiness",
            "required_fields": ["inspection_readiness"],
            "next": "timeline_context",
        },
        {
            "key": "timeline_context",
            "label": "Timeline context",
            "required_fields": ["desired_timeline"],
            "next": "engagement_goal",
        },
        {
            "key": "engagement_goal",
            "label": "Engagement goal",
            "required_fields": ["engagement_goal"],
            "next": "summary_review",
        },
        {
            "key": "summary_review",
            "label": "Summary review",
            "required_fields": [],
            "next": "readiness_brief",
        },
        {
            "key": "readiness_brief",
            "label": "Readiness brief review",
            "required_fields": [],
            "next": "scope_confirm",
        },
        {
            "key": "scope_confirm",
            "label": "Scope confirmation",
            "required_fields": ["scope_confirmed"],
            "next": "submit_confirm",
        },
        {
            "key": "submit_confirm",
            "label": "Submit confirmation",
            "required_fields": ["submit_confirmed"],
            "next": "intake_complete",
        },
        {
            "key": "intake_complete",
            "label": "Intake complete",
            "terminal": True,
        },
    ],
}

BUILD_VILLA_WORKFLOW = {
    "initial_step": "project_intent",
    "steps": [
        {
            "key": "project_intent",
            "label": "Project intent",
            "required_fields": ["project_objective"],
            "next": "city",
        },
        {
            "key": "city",
            "label": "Project city",
            "required_fields": ["city"],
            "next": "land_ownership",
        },
        {
            "key": "land_ownership",
            "label": "Land ownership type",
            "required_fields": ["land_ownership_type"],
            "next": "land_area",
        },
        {
            "key": "land_area",
            "label": "Land area",
            "required_fields": ["land_area_sqm"],
            "next": "household_needs",
        },
        {
            "key": "household_needs",
            "label": "Household and use",
            "required_fields": [],
            "next": "space_program",
        },
        {
            "key": "space_program",
            "label": "Space program",
            "required_fields": [],
            "next": "budget_context",
        },
        {
            "key": "budget_context",
            "label": "Budget context",
            "required_fields": ["budget_range"],
            "next": "timeline_context",
        },
        {
            "key": "timeline_context",
            "label": "Timeline context",
            "required_fields": ["desired_start"],
            "next": "design_direction",
        },
        {
            "key": "design_direction",
            "label": "Design direction",
            "required_fields": ["design_style"],
            "next": "documents_context",
        },
        {
            "key": "documents_context",
            "label": "Documents and context",
            "required_fields": [],
            "next": "desired_service",
        },
        {
            "key": "desired_service",
            "label": "Desired service",
            "required_fields": ["desired_service"],
            "next": "summary_review",
        },
        {
            "key": "summary_review",
            "label": "Summary review",
            "required_fields": [],
            "next": "brief_review",
        },
        {
            "key": "brief_review",
            "label": "Preliminary brief review",
            "required_fields": [],
            "next": "scope_confirm",
        },
        {
            "key": "scope_confirm",
            "label": "Scope confirmation",
            "required_fields": ["scope_confirmed"],
            "next": "submit_confirm",
        },
        {
            "key": "submit_confirm",
            "label": "Submit confirmation",
            "required_fields": ["submit_confirmed"],
            "next": "intake_complete",
        },
        {
            "key": "intake_complete",
            "label": "Intake complete",
            "terminal": True,
        },
    ],
}

GOVERNMENT_SERVICES_WORKFLOW = {
    "initial_step": "service_category",
    "steps": [
        {
            "key": "service_category",
            "label": "Service category",
            "required_fields": ["service_category"],
            "next": "property_location",
        },
        {
            "key": "property_location",
            "label": "Property location",
            "required_fields": ["property_location"],
            "next": "property_type",
        },
        {
            "key": "property_type",
            "label": "Property type",
            "required_fields": ["property_type"],
            "next": "request_summary",
        },
        {
            "key": "request_summary",
            "label": "Request summary",
            "required_fields": ["request_summary"],
            "next": "documents_status",
        },
        {
            "key": "documents_status",
            "label": "Documents status",
            "required_fields": ["documents_status"],
            "next": "urgency_context",
        },
        {
            "key": "urgency_context",
            "label": "Urgency",
            "required_fields": ["urgency"],
            "next": "summary_review",
        },
        {
            "key": "summary_review",
            "label": "Summary review",
            "required_fields": [],
            "next": "task_roadmap_brief",
        },
        {
            "key": "task_roadmap_brief",
            "label": "Task roadmap brief",
            "required_fields": [],
            "next": "scope_confirm",
        },
        {
            "key": "scope_confirm",
            "label": "Scope confirmation",
            "required_fields": ["scope_confirmed"],
            "next": "submit_confirm",
        },
        {
            "key": "submit_confirm",
            "label": "Submit confirmation",
            "required_fields": ["submit_confirmed"],
            "next": "intake_complete",
        },
        {
            "key": "intake_complete",
            "label": "Intake complete",
            "terminal": True,
        },
    ],
}

FACILITY_MANAGEMENT_WORKFLOW = {
    "initial_step": "facility_type",
    "steps": [
        {
            "key": "facility_type",
            "label": "Facility type",
            "required_fields": ["facility_type"],
            "next": "asset_location",
        },
        {
            "key": "asset_location",
            "label": "Asset location",
            "required_fields": ["location"],
            "next": "facility_scope",
        },
        {
            "key": "facility_scope",
            "label": "Facility scope",
            "required_fields": ["facility_scope"],
            "next": "operational_challenge",
        },
        {
            "key": "operational_challenge",
            "label": "Operational challenge",
            "required_fields": ["operational_challenge"],
            "next": "service_maturity",
        },
        {
            "key": "service_maturity",
            "label": "Service maturity",
            "required_fields": ["service_maturity"],
            "next": "engagement_goal",
        },
        {
            "key": "engagement_goal",
            "label": "Engagement goal",
            "required_fields": ["engagement_goal"],
            "next": "timeline_context",
        },
        {
            "key": "timeline_context",
            "label": "Timeline context",
            "required_fields": ["target_timeline"],
            "next": "readiness_context",
        },
        {
            "key": "readiness_context",
            "label": "Readiness context",
            "required_fields": [],
            "next": "summary_review",
        },
        {
            "key": "summary_review",
            "label": "Summary review",
            "required_fields": [],
            "next": "readiness_brief",
        },
        {
            "key": "readiness_brief",
            "label": "Readiness brief review",
            "required_fields": [],
            "next": "scope_confirm",
        },
        {
            "key": "scope_confirm",
            "label": "Scope confirmation",
            "required_fields": ["scope_confirmed"],
            "next": "submit_confirm",
        },
        {
            "key": "submit_confirm",
            "label": "Submit confirmation",
            "required_fields": ["submit_confirmed"],
            "next": "intake_complete",
        },
        {
            "key": "intake_complete",
            "label": "Intake complete",
            "terminal": True,
        },
    ],
}

REAL_ESTATE_MARKETING_WORKFLOW = {
    "initial_step": "marketing_goal",
    "steps": [
        {
            "key": "marketing_goal",
            "label": "Marketing goal",
            "required_fields": ["marketing_goal"],
            "next": "property_description",
        },
        {
            "key": "property_description",
            "label": "Property description",
            "required_fields": ["property_description"],
            "next": "property_location",
        },
        {
            "key": "property_location",
            "label": "Property location",
            "required_fields": ["property_location"],
            "next": "target_audience",
        },
        {
            "key": "target_audience",
            "label": "Target audience",
            "required_fields": ["target_audience"],
            "next": "marketing_stage",
        },
        {
            "key": "marketing_stage",
            "label": "Marketing stage",
            "required_fields": ["marketing_stage"],
            "next": "existing_assets",
        },
        {
            "key": "existing_assets",
            "label": "Existing assets",
            "required_fields": ["existing_assets"],
            "next": "channels_context",
        },
        {
            "key": "channels_context",
            "label": "Channels interest",
            "required_fields": [],
            "next": "timeline_context",
        },
        {
            "key": "timeline_context",
            "label": "Timeline context",
            "required_fields": ["target_timeline"],
            "next": "budget_context",
        },
        {
            "key": "budget_context",
            "label": "Budget context",
            "required_fields": [],
            "next": "summary_review",
        },
        {
            "key": "summary_review",
            "label": "Summary review",
            "required_fields": [],
            "next": "marketing_readiness_brief",
        },
        {
            "key": "marketing_readiness_brief",
            "label": "Marketing readiness brief",
            "required_fields": [],
            "next": "scope_confirm",
        },
        {
            "key": "scope_confirm",
            "label": "Scope confirmation",
            "required_fields": ["scope_confirmed"],
            "next": "submit_confirm",
        },
        {
            "key": "submit_confirm",
            "label": "Submit confirmation",
            "required_fields": ["submit_confirmed"],
            "next": "intake_complete",
        },
        {
            "key": "intake_complete",
            "label": "Intake complete",
            "terminal": True,
        },
    ],
}

REAL_ESTATE_DEVELOPMENT_WORKFLOW = {
    "initial_step": "asset_context",
    "steps": [
        {
            "key": "asset_context",
            "label": "Asset context",
            "required_fields": ["asset_context"],
            "next": "asset_location",
        },
        {
            "key": "asset_location",
            "label": "Asset location",
            "required_fields": ["asset_location"],
            "next": "development_objective",
        },
        {
            "key": "development_objective",
            "label": "Development objective",
            "required_fields": ["development_objective"],
            "next": "intended_use",
        },
        {
            "key": "intended_use",
            "label": "Intended use",
            "required_fields": ["intended_use"],
            "next": "current_status",
        },
        {
            "key": "current_status",
            "label": "Current status",
            "required_fields": ["current_status"],
            "next": "constraints_context",
        },
        {
            "key": "constraints_context",
            "label": "Known constraints",
            "required_fields": [],
            "next": "documents_readiness",
        },
        {
            "key": "documents_readiness",
            "label": "Documents readiness",
            "required_fields": ["documents_readiness"],
            "next": "timeline_context",
        },
        {
            "key": "timeline_context",
            "label": "Timeline context",
            "required_fields": ["target_timeline"],
            "next": "summary_review",
        },
        {
            "key": "summary_review",
            "label": "Summary review",
            "required_fields": [],
            "next": "opportunity_snapshot_brief",
        },
        {
            "key": "opportunity_snapshot_brief",
            "label": "Opportunity snapshot brief",
            "required_fields": [],
            "next": "scope_confirm",
        },
        {
            "key": "scope_confirm",
            "label": "Scope confirmation",
            "required_fields": ["scope_confirmed"],
            "next": "submit_confirm",
        },
        {
            "key": "submit_confirm",
            "label": "Submit confirmation",
            "required_fields": ["submit_confirmed"],
            "next": "intake_complete",
        },
        {
            "key": "intake_complete",
            "label": "Intake complete",
            "terminal": True,
        },
    ],
}

FURNISHING_WORKFLOW = {
    "initial_step": "space_type",
    "steps": [
        {
            "key": "space_type",
            "label": "Space type",
            "required_fields": ["space_type"],
            "next": "project_stage",
        },
        {
            "key": "project_stage",
            "label": "Project stage",
            "required_fields": ["project_stage"],
            "next": "furnishing_goal",
        },
        {
            "key": "furnishing_goal",
            "label": "Furnishing goal",
            "required_fields": ["furnishing_goal"],
            "next": "style_direction",
        },
        {
            "key": "style_direction",
            "label": "Style direction",
            "required_fields": ["style_direction"],
            "next": "functional_priorities",
        },
        {
            "key": "functional_priorities",
            "label": "Functional priorities",
            "required_fields": ["functional_priorities"],
            "next": "room_scope",
        },
        {
            "key": "room_scope",
            "label": "Room scope",
            "required_fields": ["room_scope"],
            "next": "budget_range",
        },
        {
            "key": "budget_range",
            "label": "Budget range",
            "required_fields": ["budget_range"],
            "next": "timeline_context",
        },
        {
            "key": "timeline_context",
            "label": "Timeline context",
            "required_fields": ["target_timeline"],
            "next": "procurement_preference",
        },
        {
            "key": "procurement_preference",
            "label": "Procurement preference",
            "required_fields": ["procurement_preference"],
            "next": "readiness_context",
        },
        {
            "key": "readiness_context",
            "label": "Readiness context",
            "required_fields": [],
            "next": "summary_review",
        },
        {
            "key": "summary_review",
            "label": "Summary review",
            "required_fields": [],
            "next": "readiness_brief",
        },
        {
            "key": "readiness_brief",
            "label": "Readiness brief review",
            "required_fields": [],
            "next": "scope_confirm",
        },
        {
            "key": "scope_confirm",
            "label": "Scope confirmation",
            "required_fields": ["scope_confirmed"],
            "next": "submit_confirm",
        },
        {
            "key": "submit_confirm",
            "label": "Submit confirmation",
            "required_fields": ["submit_confirmed"],
            "next": "intake_complete",
        },
        {
            "key": "intake_complete",
            "label": "Intake complete",
            "terminal": True,
        },
    ],
}

DEFAULT_DEFINITIONS = [
    {
        "journey_type": "generic_demo",
        "name": "Generic Demo Journey",
        "description": "Generic JOS foundation journey for validation and testing.",
        "workflow_definition": GENERIC_DEMO_WORKFLOW,
    },
    {
        "journey_type": "build_villa",
        "name": "Build Villa Discovery",
        "description": "M1 discovery and intake journey for Build Villa.",
        "workflow_definition": BUILD_VILLA_WORKFLOW,
    },
    {
        "journey_type": "engineering_consulting",
        "name": "Engineering Consulting Intake",
        "description": "Pilot #08 engineering consulting discovery journey.",
        "workflow_definition": ENGINEERING_CONSULTING_WORKFLOW,
    },
    {
        "journey_type": "contracting",
        "name": "Contracting Readiness Intake",
        "description": "Pilot #09 contracting readiness discovery journey.",
        "workflow_definition": CONTRACTING_WORKFLOW,
    },
    {
        "journey_type": "real_estate_valuation",
        "name": "Real Estate Valuation Readiness Intake",
        "description": "Pilot #05 real estate valuation readiness discovery journey.",
        "workflow_definition": REAL_ESTATE_VALUATION_WORKFLOW,
    },
    {
        "journey_type": "smart_maintenance",
        "name": "Smart Maintenance Readiness Intake",
        "description": "Pilot #13 smart maintenance readiness discovery journey.",
        "workflow_definition": SMART_MAINTENANCE_WORKFLOW,
    },
    {
        "journey_type": "project_management",
        "name": "Project Management Readiness Intake",
        "description": "Pilot #07 project management readiness discovery journey.",
        "workflow_definition": PROJECT_MANAGEMENT_WORKFLOW,
    },
    {
        "journey_type": "furnishing",
        "name": "Furnishing Readiness Intake",
        "description": "Pilot #15 furnishing readiness discovery journey.",
        "workflow_definition": FURNISHING_WORKFLOW,
    },
    {
        "journey_type": "facility_management",
        "name": "Facility Management Readiness Intake",
        "description": "Pilot #14 facility management readiness discovery journey.",
        "workflow_definition": FACILITY_MANAGEMENT_WORKFLOW,
    },
    {
        "journey_type": "government_services",
        "name": "Government Services Intake",
        "description": "Pilot #06 government services preliminary task roadmap journey.",
        "workflow_definition": GOVERNMENT_SERVICES_WORKFLOW,
    },
    {
        "journey_type": "real_estate_development",
        "name": "Real Estate Development Intake",
        "description": "Pilot #01 real estate development preliminary opportunity snapshot journey.",
        "workflow_definition": REAL_ESTATE_DEVELOPMENT_WORKFLOW,
    },
    {
        "journey_type": "real_estate_marketing",
        "name": "Real Estate Marketing Intake",
        "description": "Pilot #02 real estate marketing preliminary readiness brief journey.",
        "workflow_definition": REAL_ESTATE_MARKETING_WORKFLOW,
    },
]

UPSERT_JOURNEY_TYPES = frozenset(
    {
        "build_villa",
        "engineering_consulting",
        "contracting",
        "real_estate_valuation",
        "smart_maintenance",
        "project_management",
        "furnishing",
        "facility_management",
        "government_services",
        "real_estate_development",
        "real_estate_marketing",
    }
)


async def upsert_journey_definition(db: AsyncSession, item: dict) -> None:
    """Insert or update a journey definition by journey_type."""
    validate_workflow_definition(item["workflow_definition"])

    result = await db.execute(
        select(JourneyDefinition).where(JourneyDefinition.journey_type == item["journey_type"])
    )
    existing = result.scalar_one_or_none()
    now = datetime.now(timezone.utc)

    if existing:
        existing.name = item["name"]
        existing.description = item["description"]
        existing.workflow_definition = item["workflow_definition"]
        existing.is_active = True
        existing.updated_at = now
        logger.info("Updated JOS journey definition: %s", item["journey_type"])
        return

    db.add(
        JourneyDefinition(
            journey_type=item["journey_type"],
            name=item["name"],
            description=item["description"],
            workflow_definition=item["workflow_definition"],
            is_active=True,
            created_at=now,
            updated_at=now,
        )
    )
    logger.info("Inserted JOS journey definition: %s", item["journey_type"])


async def initialize_jos_definitions(db: AsyncSession) -> None:
    for item in DEFAULT_DEFINITIONS:
        if item["journey_type"] in UPSERT_JOURNEY_TYPES:
            await upsert_journey_definition(db, item)
            continue

        validate_workflow_definition(item["workflow_definition"])
        result = await db.execute(
            select(JourneyDefinition).where(JourneyDefinition.journey_type == item["journey_type"])
        )
        if result.scalar_one_or_none():
            continue

        db.add(
            JourneyDefinition(
                journey_type=item["journey_type"],
                name=item["name"],
                description=item["description"],
                workflow_definition=item["workflow_definition"],
                is_active=True,
            )
        )

    await db.commit()
    logger.info("JOS journey definitions seeded")
