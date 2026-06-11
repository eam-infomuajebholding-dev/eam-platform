import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.site_videos import Site_videos

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Site_videosService:
    """Service layer for Site_videos operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Site_videos]:
        """Create a new site_videos"""
        try:
            obj = Site_videos(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created site_videos with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating site_videos: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Site_videos]:
        """Get site_videos by ID"""
        try:
            query = select(Site_videos).where(Site_videos.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching site_videos {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of site_videoss"""
        try:
            query = select(Site_videos)
            count_query = select(func.count(Site_videos.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Site_videos, field):
                        query = query.where(getattr(Site_videos, field) == value)
                        count_query = count_query.where(getattr(Site_videos, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Site_videos, field_name):
                        query = query.order_by(getattr(Site_videos, field_name).desc())
                else:
                    if hasattr(Site_videos, sort):
                        query = query.order_by(getattr(Site_videos, sort))
            else:
                query = query.order_by(Site_videos.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching site_videos list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Site_videos]:
        """Update site_videos"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Site_videos {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated site_videos {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating site_videos {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete site_videos"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Site_videos {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted site_videos {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting site_videos {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Site_videos]:
        """Get site_videos by any field"""
        try:
            if not hasattr(Site_videos, field_name):
                raise ValueError(f"Field {field_name} does not exist on Site_videos")
            result = await self.db.execute(
                select(Site_videos).where(getattr(Site_videos, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching site_videos by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Site_videos]:
        """Get list of site_videoss filtered by field"""
        try:
            if not hasattr(Site_videos, field_name):
                raise ValueError(f"Field {field_name} does not exist on Site_videos")
            result = await self.db.execute(
                select(Site_videos)
                .where(getattr(Site_videos, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Site_videos.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching site_videoss by {field_name}: {str(e)}")
            raise