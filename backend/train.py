import cv2
import os
import numpy as np

faces=[]
labels=[]

dataset="data"
label=0

for student in os.listdir(dataset):

    folder=os.path.join(
        dataset,
        student
    )

    for img_name in os.listdir(folder):

        path=os.path.join(
            folder,
            img_name
        )

        img=cv2.imread(
            path,
            cv2.IMREAD_GRAYSCALE
        )

        faces.append(img)
        labels.append(label)

    label+=1

recognizer = cv2.face.LBPHFaceRecognizer_create()

recognizer.train(
    faces,
    np.array(labels)
)

recognizer.save("trainer.yml")

print("trainer.yml created")