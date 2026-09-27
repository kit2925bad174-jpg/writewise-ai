import base64
import hashlib
import hmac
import os
import secrets
import time
from typing import Optional

from sqlalchemy.orm import Session

from backend.models import User


AUTH_SECRET = os.getenv(
    "WRITEWISE_AUTH_SECRET",
    "writewise-development-secret-change-me",
)


TOKEN_TTL_SECONDS = 24 * 60 * 60


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)

    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        120_000,
    )

    return f"{salt.hex()}${digest.hex()}"


def verify_password(
    password: str,
    stored_password: str,
) -> bool:

    try:
        salt_hex, expected_hex = stored_password.split(
            "$",
            1,
        )

        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(expected_hex)

        actual = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            120_000,
        )

        return hmac.compare_digest(
            actual,
            expected,
        )

    except Exception:
        return False


def get_user_by_email(
    db: Session,
    email: str,
) -> Optional[User]:

    return (
        db.query(User)
        .filter(User.email == email.lower().strip())
        .first()
    )


def get_user_by_id(
    db: Session,
    user_id: int,
) -> Optional[User]:

    return (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )


def create_user(
    db: Session,
    name: str,
    email: str,
    password: str,
) -> User:

    user = User(
        name=name.strip(),
        email=email.lower().strip(),
        password_hash=hash_password(password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def get_or_create_demo_user(
    db: Session,
) -> User:

    email = "demo@writewise.ai"

    user = get_user_by_email(
        db,
        email,
    )

    if user:
        return user

    return create_user(
        db=db,
        name="WriteWise User",
        email=email,
        password="demo123",
    )


def create_access_token(
    user_id: int,
) -> str:

    expires_at = int(
        time.time() + TOKEN_TTL_SECONDS
    )

    payload = f"{user_id}:{expires_at}"

    signature = hmac.new(
        AUTH_SECRET.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    raw_token = f"{payload}:{signature}"

    return base64.urlsafe_b64encode(
        raw_token.encode("utf-8")
    ).decode("utf-8")


def verify_access_token(
    token: str,
) -> Optional[int]:

    try:
        raw_token = base64.urlsafe_b64decode(
            token.encode("utf-8")
        ).decode("utf-8")

        parts = raw_token.split(":")

        if len(parts) != 3:
            return None

        user_id_text, expires_text, signature = parts

        payload = f"{user_id_text}:{expires_text}"

        expected_signature = hmac.new(
            AUTH_SECRET.encode("utf-8"),
            payload.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(
            signature,
            expected_signature,
        ):
            return None

        if int(expires_text) < int(time.time()):
            return None

        return int(user_id_text)

    except Exception:
        return None