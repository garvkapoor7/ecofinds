# I will install sqlalchemy
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from typing import Optional
# i have imported fast api 
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware

app=FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# --- Helper variables and functions for password hashing and JWT ---
SECRET_KEY="GarvTheAdmin"
algorithm="HS256" # this is a standard secure algo.
ACCESS_TOKEN_EXPIRE_MINUTES=30 # i am providing the time stamp to expire it  in 30 min

pwd=CryptContext(schemes=["bcrypt"], deprecated="auto")

def hashed_password(password):
    return pwd.hash(password)

def verify_pwd(password, hashed_password):
    return pwd.verify(password, hashed_password)

def create_token(data: dict):
    for_encoding=data.copy()
    expire=datetime.utcnow()+timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    for_encoding.update({"exp": expire})
    encoded_jwt=jwt.encode(for_encoding, SECRET_KEY, algorithm=algorithm)
    return encoded_jwt

# --- End helper section ---

#I will define database url 

DATABASE_URL="sqlite:///user_authentication.db"

#creating a engine which will connect the database to my fastapi
engine=create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

#i wam creating session which will intractwith our database

SessionLocal=sessionmaker(autocommit=False, autoflush=False, bind=engine)

# i am creating a base class for my database models
Base=declarative_base()

# i am creating a model for my user : it will have 3 columns
class User(Base):
    __tablename__="users"
    id=Column(Integer, primary_key=True, index=True)
    username=Column(String, unique=True, index=True)
    email=Column(String, unique=True, index=True)
    password=Column(String)

Base.metadata.create_all(bind=engine) # i am creating a base class and this wil create the tables into it

# This function will create session for my database
def get_db():
    db=SessionLocal()
    try:
        yield db   #yield is used to return the value and pause the function
    finally:
        db.close()

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
class UserLogin(BaseModel):
    username: str
    password: str
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    class Config:
     orm_mode=True




# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to User Authentication API", "endpoints": ["/users/"]}











#i am going for the First operation: creating a route for my user or i can say the endpoint for my user
@app.post("/users/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    
    hashed_password_value=hashed_password(user.password)
    try:
        db_user = User(username=user.username, email=user.email, password=hashed_password_value)
        db.add(db_user) # this add the user
        db.commit() # this save and commit the changes
        db.refresh(db_user) # this refresh the user table
        return db_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Username or email already exists"
        )












#NOW i am going to second operation that is READ operation
@app.get("/users/", response_model=List[UserResponse])
def get_user(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    db_user=db.query(User).offset(skip).limit(limit).all()
    
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user




@app.get("/users/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    db_user=db.query(User).filter(User.id==user_id).first()
    
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user






#NOW i am going for the third operation that is UPDATE operation

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None


@app.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user: UserCreate, db: Session = Depends(get_db)):
    db_user=db.query(User).filter(User.id==user_id).first()
    
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    

    db_user.username=user.username if user.username is not None else db_user.username
    db_user.email=user.email if user.email is not None else db_user.email
    db.commit()
    db.refresh(db_user)
    return db_user





#now i am going for the last operation that is DELETE operation
@app.delete("/users/{user_id}", response_model=UserResponse)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user=db.query(User).filter(User.id==user_id).first()
    
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    
    return db_user



# this route will give me a proper authentication with fine logic to my user to login
@app.post("/signin")
def signin(user: UserLogin, db: Session = Depends(get_db)):
    # Try to find user by username or email
    db_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.username)
    ).first()
    
    if db_user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_pwd(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "Bearer"}






