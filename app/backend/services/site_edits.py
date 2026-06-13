import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.site_edits import Site_edits

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Site_editsService:
    """Service layer for Site_edits operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Site_edits]:
        """Create a new site_edits"""
        try:
            obj = Site_edits(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created site_edits with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating site_edits: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Site_edits]:
        """Get site_edits by ID"""
        try:
            query = select(Site_edits).where(Site_edits.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching site_edits {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of site_editss"""
        try:
            query = select(Site_edits)
            count_query = select(func.count(Site_edits.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Site_edits, field):
                        query = query.where(getattr(Site_edits, field) == value)
                        count_query = count_query.where(getattr(Site_edits, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Site_edits, field_name):
                        query = query.order_by(getattr(Site_edits, field_name).desc())
                else:
                    if hasattr(Site_edits, sort):
                        query = query.order_by(getattr(Site_edits, sort))
            else:
                query = query.order_by(Site_edits.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching site_edits list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Site_edits]:
        """Update site_edits"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Site_edits {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated site_edits {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating site_edits {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete site_edits"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Site_edits {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted site_edits {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting site_edits {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Site_edits]:
        """Get site_edits by any field"""
        try:
            if not hasattr(Site_edits, field_name):
                raise ValueError(f"Field {field_name} does not exist on Site_edits")
            result = await self.db.execute(
                select(Site_edits).where(getattr(Site_edits, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching site_edits by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Site_edits]:
        """Get list of site_editss filtered by field"""
        try:
            if not hasattr(Site_edits, field_name):
                raise ValueError(f"Field {field_name} does not exist on Site_edits")
            result = await self.db.execute(
                select(Site_edits)
                .where(getattr(Site_edits, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Site_edits.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching site_editss by {field_name}: {str(e)}")
            raise