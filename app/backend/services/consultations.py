import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.consultations import Consultations

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class ConsultationsService:
    """Service layer for Consultations operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Consultations]:
        """Create a new consultations"""
        try:
            obj = Consultations(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created consultations with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating consultations: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Consultations]:
        """Get consultations by ID"""
        try:
            query = select(Consultations).where(Consultations.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching consultations {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of consultationss"""
        try:
            query = select(Consultations)
            count_query = select(func.count(Consultations.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Consultations, field):
                        query = query.where(getattr(Consultations, field) == value)
                        count_query = count_query.where(getattr(Consultations, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Consultations, field_name):
                        query = query.order_by(getattr(Consultations, field_name).desc())
                else:
                    if hasattr(Consultations, sort):
                        query = query.order_by(getattr(Consultations, sort))
            else:
                query = query.order_by(Consultations.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching consultations list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Consultations]:
        """Update consultations"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Consultations {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated consultations {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating consultations {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete consultations"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Consultations {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted consultations {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting consultations {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Consultations]:
        """Get consultations by any field"""
        try:
            if not hasattr(Consultations, field_name):
                raise ValueError(f"Field {field_name} does not exist on Consultations")
            result = await self.db.execute(
                select(Consultations).where(getattr(Consultations, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching consultations by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Consultations]:
        """Get list of consultationss filtered by field"""
        try:
            if not hasattr(Consultations, field_name):
                raise ValueError(f"Field {field_name} does not exist on Consultations")
            result = await self.db.execute(
                select(Consultations)
                .where(getattr(Consultations, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Consultations.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching consultationss by {field_name}: {str(e)}")
            raise