from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import SessionLocal, engine
import models
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json

from face_utils import (
    get_embedding_from_base64,
    save_face_sample,
    retrain_lbph_model,
    predict_student,
)

# Create DB tables
models.Base.metadata.create_all(bind=engine)


def ensure_schema():
    """Ensure older SQLite databases get newer required columns."""
    with engine.begin() as conn:
        columns = conn.execute(
            text("PRAGMA table_info(students)")
        ).fetchall()
        column_names = {row[1] for row in columns}
        if "face_embedding" not in column_names:
            conn.execute(
                text("ALTER TABLE students ADD COLUMN face_embedding VARCHAR")
            )


ensure_schema()

app = FastAPI(title="Smart Attendance System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Root API
@app.get("/")
def root():
    return {"message": "Backend is running successfully"}

# Pydantic schema
class StudentCreate(BaseModel):
    name: str
    roll_no: str

class FaceRegistration(BaseModel):
    student_id: int
    image_base64: str

class MarkAttendanceRequest(BaseModel):
    image_base64: str
    latitude: float | None = None
    longitude: float | None = None

# Create student API
@app.post("/students")
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    new_student = models.Student(
        name=student.name,
        roll_no=student.roll_no
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return {
        "message": "Student added successfully",
        "id": new_student.id
    }

@app.get("/students")
def get_students(db: Session = Depends(get_db)):
    students = db.query(models.Student).all()
    # We shouldn't send the large face embeddings to the frontend normally, but currently returning all columns
    return [{"id": s.id, "name": s.name, "roll_no": s.roll_no, "is_face_registered": s.face_embedding is not None} for s in students]

# Register Face API
@app.post("/register-face")
def register_face(req: FaceRegistration, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    face_roi, err = get_embedding_from_base64(req.image_base64)
    if err:
        raise HTTPException(status_code=400, detail=err)

    saved_path = save_face_sample(req.student_id, face_roi)
    train_count, train_err = retrain_lbph_model()
    if train_err:
        raise HTTPException(status_code=500, detail=train_err)

    student.face_embedding = json.dumps({
        "registered": True,
        "last_sample_path": saved_path
    })
    db.commit()

    return {
        "message": "Face registered successfully",
        "trained_samples": train_count
    }

# Mark Attendance API
@app.post("/mark-attendance")
def mark_attendance(req: MarkAttendanceRequest,
                    db: Session = Depends(get_db)):

    incoming_face_roi, err = get_embedding_from_base64(
        req.image_base64
    )

    if err:
        raise HTTPException(
            status_code=400,
            detail=err
        )

    matched_student_id, confidence, predict_err = predict_student(
        incoming_face_roi
    )
    if predict_err:
        raise HTTPException(
            status_code=400,
            detail=predict_err
        )
    if matched_student_id is None or confidence is None:
        raise HTTPException(
            status_code=401,
            detail="Face not recognized"
        )

    # LBPH returns distance-like confidence where lower is better.
    match_threshold = 65.0
    if confidence > match_threshold:
        raise HTTPException(
            status_code=401,
            detail="Face not recognized"
        )

    matched_student = db.query(models.Student).filter(
        models.Student.id == matched_student_id
    ).first()

    if not matched_student:
        raise HTTPException(
            status_code=404,
            detail="Matched student not found"
        )

    new_log = models.AttendanceLog(
        student_id=matched_student.id,
        status="Present"
    )
    db.add(new_log)
    db.commit()

    return {
        "message": f"Attendance marked for {matched_student.name}",
        "confidence": confidence,
        "threshold": match_threshold
    }
