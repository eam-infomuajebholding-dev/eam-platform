import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.social_links import Social_links

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Social_linksService:
    """Service layer for Social_links operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Social_links]:
        """Create a new social_links"""
        try:
            obj = Social_links(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created social_links with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating social_links: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Social_links]:
        """Get social_links by ID"""
        try:
            query = select(Social_links).where(Social_links.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching social_links {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of social_linkss"""
        try:
            query = select(Social_links)
            count_query = select(func.count(Social_links.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Social_links, field):
                        query = query.where(getattr(Social_links, field) == value)
                        count_query = count_query.where(getattr(Social_links, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Social_links, field_name):
                        query = query.order_by(getattr(Social_links, field_name).desc())
                else:
                    if hasattr(Social_links, sort):
                        query = query.order_by(getattr(Social_links, sort))
            else:
                query = query.order_by(Social_links.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching social_links list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Social_links]:
        """Update social_links"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Social_links {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated social_links {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating social_links {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete social_links"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Social_links {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted social_links {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting social_links {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Social_links]:
        """Get social_links by any field"""
        try:
            if not hasattr(Social_links, field_name):
                raise ValueError(f"Field {field_name} does not exist on Social_links")
            result = await self.db.execute(
                select(Social_links).where(getattr(Social_links, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching social_links by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Social_links]:
        """Get list of social_linkss filtered by field"""
        try:
            if not hasattr(Social_links, field_name):
                raise ValueError(f"Field {field_name} does not exist on Social_links")
            result = await self.db.execute(
                select(Social_links)
                .where(getattr(Social_links, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Social_links.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching social_linkss by {field_name}: {str(e)}")
            raise