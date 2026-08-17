from passlib.context import CryptContext
from jwt import encode, decode
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import bcrypt

load_dotenv()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Secret
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    # Truncate to 72 characters and hash with bcrypt
    truncated = password[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(truncated.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    truncated = plain_password[:72]
    return bcrypt.checkpw(truncated.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt