from app.db.session import SessionLocal
from app.models.models import User, Career
from sqlalchemy import asc
db = SessionLocal()
users = db.query(User).order_by(asc(User.id)).all()
print('Total usuarios:', len(users))
for u in users:
    career_ids = [c.id for c in getattr(u, 'careers', [])]
    career_str = f" careers={career_ids}" if career_ids else ""
    phone = f" phone={u.phone}" if getattr(u, 'phone', None) else ""
    tg = f" tg={u.telegram_chat_id}" if getattr(u, 'telegram_chat_id', None) else ""
    print(f"{u.id:3} | {u.email:45} | {u.role:25} | active={u.is_active}{career_str}{phone}{tg}")
db.close()
