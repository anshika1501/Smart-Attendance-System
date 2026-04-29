import base64
import json
import os
import re
import time
import cv2
import numpy as np

DATA_DIR = "data"
MODEL_PATH = "trainer.yml"
LABEL_MAP_PATH = "label_map.json"
FACE_SIZE = (200, 200)

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)


def get_embedding_from_base64(base64_string):
    """
    Returns a normalized grayscale face ROI for LBPH training/prediction.
    """
    try:
        if not base64_string or not isinstance(base64_string, str):
            return None, "Image payload is empty"

        if "," in base64_string:
            base64_string = base64_string.split(",", 1)[1]

        base64_string = base64_string.strip()
        if not base64_string:
            return None, "Image payload is empty"

        img_data = base64.b64decode(base64_string)
        if not img_data:
            return None, "Image payload is empty"

        np_arr = np.frombuffer(img_data, np.uint8)
        if np_arr.size == 0:
            return None, "Image payload is empty"

        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            return None, "Invalid image data"

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

        if len(faces) == 0:
            return None, "No face detected"
        if len(faces) > 1:
            return None, "Multiple faces detected"

        x, y, w, h = faces[0]
        roi = gray[y:y + h, x:x + w]
        roi = cv2.resize(roi, FACE_SIZE, interpolation=cv2.INTER_AREA)
        roi = cv2.equalizeHist(roi)

        return roi, None

    except Exception as e:
        return None, str(e)


def save_face_sample(student_id, face_roi):
    student_dir = os.path.join(DATA_DIR, str(student_id))
    os.makedirs(student_dir, exist_ok=True)

    file_path = os.path.join(student_dir, f"{int(time.time() * 1000)}.jpg")
    cv2.imwrite(file_path, face_roi)
    return file_path


def retrain_lbph_model():
    faces = []
    labels = []
    label_to_student_id = {}

    if not os.path.isdir(DATA_DIR):
        return None, "No training dataset found"

    student_dirs = sorted(
        d for d in os.listdir(DATA_DIR)
        if os.path.isdir(os.path.join(DATA_DIR, d))
    )

    label = 0
    for student_dir in student_dirs:
        if student_dir.isdigit():
            student_id = int(student_dir)
        else:
            match = re.search(r"\d+", student_dir)
            if not match:
                # Ignore folders without a student id.
                continue
            student_id = int(match.group())

        folder_path = os.path.join(DATA_DIR, student_dir)
        image_files = [
            f for f in os.listdir(folder_path)
            if f.lower().endswith((".jpg", ".jpeg", ".png"))
        ]
        added_for_student = 0

        for image_name in image_files:
            path = os.path.join(folder_path, image_name)
            img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
            if img is None:
                continue
            img = cv2.resize(img, FACE_SIZE, interpolation=cv2.INTER_AREA)
            img = cv2.equalizeHist(img)
            faces.append(img)
            labels.append(label)
            added_for_student += 1

        if added_for_student > 0:
            label_to_student_id[label] = student_id
            label += 1

    if not faces:
        return None, "No valid face images found for training"

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.train(faces, np.array(labels))
    recognizer.save(MODEL_PATH)

    with open(LABEL_MAP_PATH, "w", encoding="utf-8") as f:
        json.dump(label_to_student_id, f)

    return len(faces), None


def predict_student(face_roi):
    if not os.path.exists(MODEL_PATH):
        return None, None, "Model not trained yet. Please register faces first."
    if not os.path.exists(LABEL_MAP_PATH):
        return None, None, "Label map missing. Please retrain the model."

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read(MODEL_PATH)
    label, confidence = recognizer.predict(face_roi)

    with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
        label_map = json.load(f)

    student_id = label_map.get(str(label))
    if student_id is None:
        return None, float(confidence), "Predicted label not mapped to a student"

    return int(student_id), float(confidence), None



   
