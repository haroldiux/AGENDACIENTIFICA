# Technical Design: User Notification Preferences

## Technical Approach
Implement a granular 1-to-1 `UserNotificationPreference` entity linked to `User`. Expose REST endpoints for querying, updating, and testing notification preferences across Email, WhatsApp, and Telegram channels. Refactor `notification_worker.py` to respect active channel matrix flags, event category filters, user-specific lookahead windows, and custom contact overrides. Build a Next.js Notification Preference Center at `/configuracion/notificaciones` and add navigation in the `Sidebar`.

## Architecture Decisions

### Decision: 1-to-1 Preference Table with Auto-Initialization
**Choice**: Create a dedicated `UserNotificationPreference` entity linked via `user_id` (foreign key, unique). Auto-create default settings on `GET` if missing.
**Alternatives considered**: Adding preference columns directly to `User` model.
**Rationale**: Keeps core authentication/user model clean, isolated, and easy to maintain while providing simple fallback logic for existing users.

### Decision: Unified Multi-Channel Test Endpoint
**Choice**: Expose `POST /api/v1/notifications/test-channel` with channel parameter (`email`, `whatsapp`, `telegram`) and target destination resolution.
**Alternatives considered**: Separate test endpoints per channel (`test-email`, `test-telegram`, etc.).
**Rationale**: Simplifies frontend integration, centralizes contact destination coalescing logic, and provides unified error handling.

## Data Flow
1. **Preference Query & Save**: User navigates to `/configuracion/notificaciones` -> `GET /api/v1/users/me/notification-preferences` -> API returns (or auto-initializes) preferences -> UI populates form -> On submit, `PUT` updates `UserNotificationPreference` table.
2. **Diagnostic Test**: User clicks "Probar Canal" -> Frontend calls `POST /api/v1/notifications/test-channel` -> API resolves coalesced contact (`custom_* or user.*`) -> Triggers channel provider call -> Returns success/failure response.
3. **Background Worker Dispatch**: Celery worker runs `dispatch_weekly_notifications` -> Loads active users with preferences -> Calculates per-user lookahead window & event filters -> Dispatches notifications to all enabled channels (`email_enabled`, `whatsapp_enabled`, `telegram_enabled`) using coalesced destinations.

## File Changes
| File | Action | Description |
| --- | --- | --- |
| `backend/app/models/models.py` | Modify | Define `UserNotificationPreference` model & 1:1 `User` relationship. |
| `backend/app/schemas/schemas.py` | Modify | Add Pydantic schemas for preferences & multi-channel test requests. |
| `backend/app/api/v1/user_preferences.py` | Create | Implement `GET` & `PUT` endpoints for user notification preferences. |
| `backend/app/api/v1/notifications.py` | Modify | Implement `POST /api/v1/notifications/test-channel` endpoint. |
| `backend/app/api/v1/api.py` | Modify | Register `user_preferences` router. |
| `backend/app/workers/notification_worker.py` | Modify | Evaluate matrix settings, lookahead days, event types & coalesced contacts. |
| `frontend/lib/api.ts` | Modify | Add preference TypeScript types & API client functions. |
| `frontend/app/configuracion/notificaciones/page.tsx` | Create | Build Notification Preference Center UI page. |
| `frontend/components/layout/Sidebar.tsx` | Modify | Add "Notificaciones" link to navigation menu. |

## Interfaces / Contracts
```python
class UserNotificationPreferenceResponse(BaseModel):
    id: int
    user_id: int
    email_enabled: bool = True
    whatsapp_enabled: bool = False
    telegram_enabled: bool = False
    custom_email: Optional[str] = None
    custom_whatsapp: Optional[str] = None
    custom_telegram_chat_id: Optional[str] = None
    notify_academic: bool = True
    notify_scientific: bool = True
    digest_frequency: Literal["daily", "weekly", "biweekly"] = "weekly"
    lookahead_days: int = 7

class TestChannelRequest(BaseModel):
    channel: Literal["email", "whatsapp", "telegram"]
    target_destination: Optional[str] = None
```

## Testing Strategy
| Layer | What to Test | Approach |
| --- | --- | --- |
| Backend Unit | Models & auto-init logic | Pytest for GET/PUT auto-initialization & payload updates. |
| Backend Integration | Test channel endpoint & worker evaluation | Pytest mock API calls for SMTP, WhatsApp, Telegram providers. |
| Frontend Component | UI preference matrix & test triggers | React Testing Library / manual UI test for form state & feedback. |

## Migration / Rollout
1. Run Alembic migration to create `user_notification_preferences` table with foreign key `user_id`.
2. Deploy backend updates for preference endpoints & worker dispatch.
3. Deploy frontend UI changes and verified Sidebar navigation link.

## Open Questions
- None.
