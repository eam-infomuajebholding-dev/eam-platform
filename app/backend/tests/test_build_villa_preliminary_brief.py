"""Build Villa first-value preliminary brief tests."""

from services.build_villa_validators import assemble_intake_draft, assemble_preliminary_villa_brief


def test_assemble_preliminary_villa_brief_structure():
    context = {
        "project_objective": "بناء فيلا عائلية",
        "city": "الرياض",
        "land_ownership_type": "owned",
        "land_area_sqm": 900,
        "household_size": 5,
        "use_summary": "عائلة من 5 أفراد",
        "bedrooms": 4,
        "selected_spaces": ["guest_majlis", "kitchen"],
        "budget_range": "2m_5m",
        "desired_start": "within_6_months",
        "design_style": "contemporary",
        "has_documents": False,
        "desired_service": "full_service",
    }
    brief = assemble_preliminary_villa_brief(context)
    assert brief["status"] == "PRELIMINARY"
    assert brief["professional_review_required"] is True
    assert brief["title"] == "موجز مشروع فيلا أولي"
    assert brief["location"]["city"] == "الرياض"
    assert brief["project_objective"] == "بناء فيلا عائلية"
    assert brief["household_summary"]["household_size"] == 5
    assert brief["disclaimer"]


def test_intake_draft_includes_preliminary_brief():
    context = {
        "project_objective": "تصميم فيلا",
        "city": "جدة",
        "land_ownership_type": "owned",
        "land_area_sqm": 750,
        "use_summary": "سكن عائلي",
        "bedrooms": 4,
        "budget_range": "1m_2m",
        "desired_start": "flexible",
        "design_style": "modern",
        "desired_service": "design_only",
        "scope_confirmed": True,
        "submit_confirmed": True,
    }
    draft = assemble_intake_draft(context)
    assert draft["preliminary_brief"]["status"] == "PRELIMINARY"
    assert draft["journey_type"] == "build_villa"
    assert draft["submit_confirmed"] is True
