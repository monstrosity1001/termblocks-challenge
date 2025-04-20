from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
import hashlib
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import sessionmaker, relationship, declarative_base, Session
from typing import List, Optional
from uuid import uuid4
import os
from datetime import datetime

DATABASE_URL = "sqlite:///./checklists.db"
UPLOAD_DIR = "uploads"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username_hash = Column(String, unique=True, nullable=False)

class Checklist(Base):
    __tablename__ = "checklists"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    public_id = Column(String, unique=True, index=True, default=lambda: str(uuid4()))
    is_public = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    categories = relationship("Category", back_populates="checklist", cascade="all, delete-orphan")
    owner = relationship("User")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    checklist_id = Column(Integer, ForeignKey("checklists.id"))
    checklist = relationship("Checklist", back_populates="categories")
    items = relationship("Item", back_populates="category", cascade="all, delete-orphan")

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship("Category", back_populates="items")
    uploads = relationship("FileUpload", back_populates="item", cascade="all, delete-orphan")

class FileUpload(Base):
    __tablename__ = "fileuploads"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    item_id = Column(Integer, ForeignKey("items.id"))
    item = relationship("Item", back_populates="uploads")
    path = Column(String, nullable=False)

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from pydantic import BaseModel, Field

# ----------------------
# Pydantic Schemas
# ----------------------
class FileUploadSchema(BaseModel):
    id: int
    filename: str
    uploaded_at: datetime
    path: str
    class Config:
        orm_mode = True

class ItemCreateSchema(BaseModel):
    name: str

class ItemSchema(ItemCreateSchema):
    id: int
    uploads: list[FileUploadSchema] = []
    class Config:
        orm_mode = True

class CategoryCreateSchema(BaseModel):
    name: str
    items: list[ItemCreateSchema] = []

class CategorySchema(CategoryCreateSchema):
    id: int
    items: list[ItemSchema] = []
    class Config:
        orm_mode = True

class ChecklistCreateSchema(BaseModel):
    title: str
    description: str = ""
    categories: list[CategoryCreateSchema] = []
    is_public: bool = False
    owner_id: int = None

class ChecklistSchema(ChecklistCreateSchema):
    id: int
    public_id: str
    is_public: bool
    categories: list[CategorySchema]
    owner_id: int = None
    class Config:
        orm_mode = True

# ----------------------
# API Endpoints
# ----------------------

@app.post("/users", response_model=dict)
def create_user(username: str, db: Session = Depends(get_db)):
    username_hash = hashlib.sha256(username.encode()).hexdigest()
    user = db.query(User).filter_by(username_hash=username_hash).first()
    if not user:
        user = User(username_hash=username_hash)
        db.add(user)
        db.commit()
        db.refresh(user)
    return {"id": user.id, "username_hash": user.username_hash}


from fastapi import Query

@app.get("/checklists", response_model=list[ChecklistSchema])
def list_checklists(user_id: int = Query(None), db: Session = Depends(get_db)):
    query = db.query(Checklist)
    if user_id is not None:
        query = query.filter(Checklist.owner_id == user_id)
    return query.all()

@app.post("/checklists", response_model=ChecklistSchema)
def create_checklist(data: ChecklistCreateSchema, db: Session = Depends(get_db)):
    checklist = Checklist(
        title=data.title,
        description=data.description,
        owner_id=data.owner_id
    )
    for cat in data.categories:
        category = Category(name=cat.name)
        for item in cat.items:
            category.items.append(Item(name=item.name))
        checklist.categories.append(category)
    db.add(checklist)
    db.commit()
    db.refresh(checklist)
    return checklist

@app.get("/checklists/{checklist_id}", response_model=ChecklistSchema)
def get_checklist(checklist_id: int, db: Session = Depends(get_db)):
    checklist = db.query(Checklist).filter(Checklist.id == checklist_id).first()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    return checklist

@app.put("/checklists/{checklist_id}", response_model=ChecklistSchema)
def update_checklist(checklist_id: int, data: ChecklistCreateSchema, db: Session = Depends(get_db)):
    checklist = db.query(Checklist).filter(Checklist.id == checklist_id).first()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    checklist.title = data.title
    checklist.description = data.description
    checklist.owner_id = data.owner_id
    checklist.categories.clear()
    for cat in data.categories:
        category = Category(name=cat.name)
        for item in cat.items:
            category.items.append(Item(name=item.name))
        checklist.categories.append(category)
    db.commit()
    db.refresh(checklist)
    return checklist

@app.delete("/checklists/{checklist_id}")
def delete_checklist(checklist_id: int, db: Session = Depends(get_db)):
    checklist = db.query(Checklist).filter(Checklist.id == checklist_id).first()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    db.delete(checklist)
    db.commit()
    return {"ok": True}

@app.post("/checklists/{checklist_id}/make_public")
def make_public_checklist(checklist_id: int, db: Session = Depends(get_db)):
    checklist = db.query(Checklist).filter(Checklist.id == checklist_id).first()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    if not checklist.public_id:
        from uuid import uuid4
        checklist.public_id = str(uuid4())
    checklist.is_public = 1
    db.commit()
    db.refresh(checklist)
    public_url = f"http://localhost:8080/public/{checklist.public_id}"
    return {"public_url": public_url}

@app.post("/checklists/{checklist_id}/clone", response_model=ChecklistSchema)
def clone_checklist(checklist_id: int, db: Session = Depends(get_db)):
    orig = db.query(Checklist).filter(Checklist.id == checklist_id).first()
    if not orig:
        raise HTTPException(status_code=404, detail="Checklist not found")
    clone = Checklist(title=orig.title + " (Clone)", description=orig.description)
    for cat in orig.categories:
        new_cat = Category(name=cat.name)
        for item in cat.items:
            new_cat.items.append(Item(name=item.name))
        clone.categories.append(new_cat)
    db.add(clone)
    db.commit()
    db.refresh(clone)
    return clone

@app.get("/public/{public_id}", response_model=ChecklistSchema)
def get_public_checklist(public_id: str, db: Session = Depends(get_db)):
    checklist = db.query(Checklist).filter(Checklist.public_id == public_id).first()
    if not checklist or not checklist.is_public:
        raise HTTPException(status_code=404, detail="Checklist not found")
    return checklist

@app.post("/items/{item_id}/upload", response_model=FileUploadSchema)
def upload_file(item_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    ALLOWED_EXTS = {".txt", ".pdf", ".xlsx"}
    MAX_SIZE = 10 * 1024 * 1024  # 10MB
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail="Invalid file type")
    contents = file.file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    checklist_item = db.query(Item).filter(Item.id == item_id).first()
    if not checklist_item:
        raise HTTPException(status_code=404, detail="Item not found")
    save_name = f"{uuid4().hex}_{file.filename}"
    save_path = os.path.join(UPLOAD_DIR, save_name)
    with open(save_path, "wb") as f:
        f.write(contents)
    upload = FileUpload(filename=file.filename, path=save_path, item=checklist_item)
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload

@app.delete("/uploads/{file_id}")
def delete_upload(file_id: int, db: Session = Depends(get_db)):
    upload = db.query(FileUpload).filter(FileUpload.id == file_id).first()
    if not upload:
        raise HTTPException(status_code=404, detail="File not found")
    # Remove file from disk
    try:
        if os.path.exists(upload.path):
            os.remove(upload.path)
    except Exception as e:
        pass  # Ignore file system errors
    db.delete(upload)
    db.commit()
    return {"ok": True}

from fastapi.responses import FileResponse

@app.get("/public_uploads/{file_id}")
def serve_public_upload(file_id: int, db: Session = Depends(get_db)):
    upload = db.query(FileUpload).filter(FileUpload.id == file_id).first()
    if not upload:
        raise HTTPException(status_code=404, detail="File not found")
    # Check if parent checklist is public
    item = db.query(Item).filter(Item.id == upload.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    category = db.query(Category).filter(Category.id == item.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    checklist = db.query(Checklist).filter(Checklist.id == category.checklist_id).first()
    if not checklist or not checklist.is_public:
        raise HTTPException(status_code=403, detail="Checklist is not public")
    # Serve file
    return FileResponse(upload.path, filename=upload.filename)

@app.get("/")
def root():
    return {"message": "Termblocks Checklist Builder API"}
