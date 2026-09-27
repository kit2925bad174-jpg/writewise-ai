import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from backend.auth import (
    create_access_token,
    create_user,
    get_or_create_demo_user,
    get_user_by_email,
    verify_password,
)
from backend.database import get_db


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


EMAIL_PATTERN = re.compile(
    r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
)


class RegisterRequest(BaseModel):

    name: str = Field(
        min_length=2,
        max_length=120,
    )

    email: str = Field(
        min_length=5,
        max_length=180,
    )

    password: str = Field(
        min_length=8,
        max_length=128,
    )

    @field_validator("name")
    @classmethod
    def name_must_only_contain_letters_and_spaces(cls, value: str) -> str:
        if not any(character.isalpha() for character in value) or any(
            not character.isalpha() and character != " " for character in value
        ):
            raise ValueError("Name must contain only letters and spaces.")
        return value

    @field_validator("password")
    @classmethod
    def password_must_be_strong(cls, value: str) -> str:
        if not any(character.isupper() for character in value):
            raise ValueError("Password must contain an uppercase letter.")
        if not any(character.islower() for character in value):
            raise ValueError("Password must contain a lowercase letter.")
        if not any(character.isdigit() for character in value):
            raise ValueError("Password must contain a number.")
        if not any(not character.isalnum() for character in value):
            raise ValueError("Password must contain a special character.")
        return value


class LoginRequest(BaseModel):

    email: str = Field(
        min_length=5,
        max_length=180,
    )

    password: str = Field(
        min_length=1,
        max_length=128,
    )


def validate_email(
    email: str,
) -> bool:

    return bool(
        EMAIL_PATTERN.match(
            email.strip()
        )
    )


def public_user(user):

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at.isoformat(),
    }


@router.post("/register")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):

    email = request.email.lower().strip()

    if not validate_email(email):
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid email address.",
        )

    existing = get_user_by_email(
        db,
        email,
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Email is already registered.",
        )

    user = create_user(
        db=db,
        name=request.name,
        email=email,
        password=request.password,
    )

    token = create_access_token(
        user.id
    )

    return {
        "success": True,
        "message": "Registration successful.",
        "user": public_user(user),
        "token": token,
    }


@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):

    email = request.email.lower().strip()

    user = get_user_by_email(
        db,
        email,
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if not verify_password(
        request.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    token = create_access_token(
        user.id
    )

    return {
        "success": True,
        "message": "Login successful.",
        "user": public_user(user),
        "token": token,
    }


@router.post("/demo")
def demo_login(
    db: Session = Depends(get_db),
):

    user = get_or_create_demo_user(
        db
    )

    token = create_access_token(
        user.id
    )

    return {
        "success": True,
        "message": "Demo login successful.",
        "user": public_user(user),
        "token": token,
        "credentials": {
            "email": "demo@writewise.ai",
            "password": "demo123",
        },
    }