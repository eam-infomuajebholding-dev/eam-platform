import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.navigation_items import Navigation_items

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Navigation_itemsService:
    """Service layer for Navigation_items operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Navigation_items]:
        """Create a new navigation_items"""
        try:
            obj = Navigation_items(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created navigation_items with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating navigation_items: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Navigation_items]:
        """Get navigation_items by ID"""
        try:
            query = select(Navigation_items).where(Navigation_items.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching navigation_items {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of navigation_itemss"""
        try:
            query = select(Navigation_items)
            count_query = select(func.count(Navigation_items.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Navigation_items, field):
                        query = query.where(getattr(Navigation_items, field) == value)
                        count_query = count_query.where(getattr(Navigation_items, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Navigation_items, field_name):
                        query = query.order_by(getattr(Navigation_items, field_name).desc())
                else:
                    if hasattr(Navigation_items, sort):
                        query = query.order_by(getattr(Navigation_items, sort))
            else:
                query = query.order_by(Navigation_items.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching navigation_items list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Navigation_items]:
        """Update navigation_items"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Navigation_items {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated navigation_items {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating navigation_items {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete navigation_items"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Navigation_items {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted navigation_items {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting navigation_items {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Navigation_items]:
        """Get navigation_items by any field"""
        try:
            if not hasattr(Navigation_items, field_name):
                raise ValueError(f"Field {field_name} does not exist on Navigation_items")
            result = await self.db.execute(
                select(Navigation_items).where(getattr(Navigation_items, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching navigation_items by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Navigation_items]:
        """Get list of navigation_itemss filtered by field"""
        try:
            if not hasattr(Navigation_items, field_name):
                raise ValueError(f"Field {field_name} does not exist on Navigation_items")
            result = await self.db.execute(
                select(Navigation_items)
                .where(getattr(Navigation_items, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Navigation_items.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching navigation_itemss by {field_name}: {str(e)}")
            raise