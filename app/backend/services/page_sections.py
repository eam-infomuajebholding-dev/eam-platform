import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.page_sections import Page_sections

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Page_sectionsService:
    """Service layer for Page_sections operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Page_sections]:
        """Create a new page_sections"""
        try:
            obj = Page_sections(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created page_sections with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating page_sections: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Page_sections]:
        """Get page_sections by ID"""
        try:
            query = select(Page_sections).where(Page_sections.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching page_sections {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of page_sectionss"""
        try:
            query = select(Page_sections)
            count_query = select(func.count(Page_sections.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Page_sections, field):
                        query = query.where(getattr(Page_sections, field) == value)
                        count_query = count_query.where(getattr(Page_sections, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Page_sections, field_name):
                        query = query.order_by(getattr(Page_sections, field_name).desc())
                else:
                    if hasattr(Page_sections, sort):
                        query = query.order_by(getattr(Page_sections, sort))
            else:
                query = query.order_by(Page_sections.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching page_sections list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Page_sections]:
        """Update page_sections"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Page_sections {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated page_sections {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating page_sections {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete page_sections"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Page_sections {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted page_sections {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting page_sections {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Page_sections]:
        """Get page_sections by any field"""
        try:
            if not hasattr(Page_sections, field_name):
                raise ValueError(f"Field {field_name} does not exist on Page_sections")
            result = await self.db.execute(
                select(Page_sections).where(getattr(Page_sections, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching page_sections by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Page_sections]:
        """Get list of page_sectionss filtered by field"""
        try:
            if not hasattr(Page_sections, field_name):
                raise ValueError(f"Field {field_name} does not exist on Page_sections")
            result = await self.db.execute(
                select(Page_sections)
                .where(getattr(Page_sections, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Page_sections.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching page_sectionss by {field_name}: {str(e)}")
            raise