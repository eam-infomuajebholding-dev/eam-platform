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

BUILD_VILLA_WORKFLOW = {
    "initial_step": "city",
    "steps": [
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
]

UPSERT_JOURNEY_TYPES = frozenset({"build_villa"})


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
