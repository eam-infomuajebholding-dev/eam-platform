from pydantic import BaseModel, Field

from schemas.quotes import QuoteDetailResponse


class QuoteAcceptanceResponse(BaseModel):
    quote: QuoteDetailResponse
    contract_reference: str
    operational_project_reference: str
    operational_project_status: str = Field(..., description="planned | active | closed")
