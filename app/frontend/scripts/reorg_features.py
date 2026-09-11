"""One-shot domain reorganization into src/features/."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"

MOVES = [
    (ROOT / "contexts" / "AuthContext.tsx", ROOT / "features" / "auth" / "context" / "AuthContext.tsx"),
    (ROOT / "components" / "ProtectedRoute.tsx", ROOT / "features" / "auth" / "components" / "ProtectedRoute.tsx"),
    (ROOT / "pages" / "AuthCallback.tsx", ROOT / "features" / "auth" / "pages" / "AuthCallback.tsx"),
    (ROOT / "pages" / "AuthError.tsx", ROOT / "features" / "auth" / "pages" / "AuthError.tsx"),
    (ROOT / "lib" / "auth.ts", ROOT / "features" / "auth" / "api" / "auth.ts"),
    (
        ROOT / "serviceRequests" / "serviceRequestClient.ts",
        ROOT / "features" / "service-requests" / "api" / "serviceRequestClient.ts",
    ),
    (ROOT / "serviceRequests" / "types.ts", ROOT / "features" / "service-requests" / "api" / "types.ts"),
]

for src, dst in MOVES:
    dst.parent.mkdir(parents=True, exist_ok=True)
    if src.exists():
        shutil.move(str(src), str(dst))
        print(f"moved {src.relative_to(ROOT)}")

core = ROOT / "features" / "journeys" / "core"
core.mkdir(parents=True, exist_ok=True)
for name in ["JourneyContext.tsx", "josClient.ts", "types.ts", "useJourney.ts", "index.ts"]:
    src = ROOT / "jos" / name
    if src.exists():
        shutil.move(str(src), str(core / name))

bv_src = ROOT / "jos" / "journeys" / "buildVilla"
bv_dst = ROOT / "features" / "journeys" / "build-villa"
if bv_src.exists():
    shutil.move(str(bv_src), str(bv_dst))

for name in ["WorkspaceContext.tsx", "aiCoreClient.ts", "types.ts", "index.ts"]:
    src = ROOT / "ai" / name
    dst = ROOT / "features" / "ai-workspace" / name
    dst.parent.mkdir(parents=True, exist_ok=True)
    if src.exists():
        shutil.move(str(src), str(dst))

REPLACEMENTS = [
    ("@/contexts/AuthContext", "@/features/auth/context/AuthContext"),
    ("@/components/ProtectedRoute", "@/features/auth/components/ProtectedRoute"),
    ("@/lib/auth", "@/features/auth/api/auth"),
    ("@/serviceRequests/", "@/features/service-requests/api/"),
    ("@/jos/", "@/features/journeys/"),
    ("@/ai/", "@/features/ai-workspace/"),
    ("@/features/journeys/journeys/buildVilla/", "@/features/journeys/build-villa/"),
    ("@/features/journeys/JourneyContext", "@/features/journeys/core/JourneyContext"),
    ("@/features/journeys/josClient", "@/features/journeys/core/josClient"),
    ("@/features/journeys/types", "@/features/journeys/core/types"),
    ("@/features/journeys/useJourney", "@/features/journeys/core/useJourney"),
    ("@/features/journeys/index", "@/features/journeys/core/index"),
    ("from '@/jos/journeys/buildVilla/", "from '@/features/journeys/build-villa/"),
    ("from './jos/JourneyContext'", "from '@/features/journeys/core/JourneyContext'"),
    (
        "from './jos/journeys/buildVilla/BuildVillaJourneyPage'",
        "from '@/features/journeys/build-villa/BuildVillaJourneyPage'",
    ),
    ("from './pages/AuthCallback'", "from '@/features/auth/pages/AuthCallback'"),
    ("from './pages/AuthError'", "from '@/features/auth/pages/AuthError'"),
    ("from './components/ProtectedRoute'", "from '@/features/auth/components/ProtectedRoute'"),
    ("from './contexts/AuthContext'", "from '@/features/auth/context/AuthContext'"),
    ("../lib/auth", "@/features/auth/api/auth"),
    ("../contexts/AuthContext", "@/features/auth/context/AuthContext"),
]

for path in ROOT.rglob("*"):
    if path.suffix not in {".ts", ".tsx"}:
        continue
    text = path.read_text(encoding="utf-8")
    orig = text
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    if path.is_relative_to(ROOT / "features" / "journeys" / "core"):
        text = text.replace("from './josClient'", "from '@/features/journeys/core/josClient'")
        text = text.replace("from './types'", "from '@/features/journeys/core/types'")
        text = text.replace("from './useJourney'", "from '@/features/journeys/core/useJourney'")
    if path.is_relative_to(ROOT / "features" / "journeys" / "build-villa"):
        text = text.replace("from '../types'", "from '@/features/journeys/core/types'")
        text = text.replace("from '../../types'", "from '@/features/journeys/core/types'")
        text = text.replace("from '../josClient'", "from '@/features/journeys/core/josClient'")
    if text != orig:
        path.write_text(text, encoding="utf-8")
        print(f"updated {path.relative_to(ROOT)}")

print("done")
