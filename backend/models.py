from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    roll_no = Column(String, unique=True, index=True)
    # Storing 128-d numpy array as a JSON string
    face_embedding = Column(String, nullable=True) 

    attendances = relationship("AttendanceLog", back_populates="student", cascade="all, delete-orphan")


class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="Present")

    student = relationship("Student", back_populates="attendances")