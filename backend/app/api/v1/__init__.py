from fastapi import APIRouter
from .auth import router as auth_router
from .projects import router as projects_router
from .units import router as units_router
from .photos import router as photos_router
from .bookings import router as bookings_router
from .consultations import router as consultations_router
from .users import router as users_router
from .reviews import router as reviews_router
from .favorites import router as favorites_router

router = APIRouter(prefix="/api/v1")
router.include_router(auth_router)
router.include_router(projects_router)
router.include_router(units_router)
router.include_router(photos_router)
router.include_router(bookings_router)
router.include_router(consultations_router)
router.include_router(users_router)
router.include_router(reviews_router)
router.include_router(favorites_router)
