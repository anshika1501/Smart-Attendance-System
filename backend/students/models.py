from django.db import models

# Create your models here.
from django.db import models

class Student(models.Model):
    name = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=20)
    image = models.ImageField(upload_to='students/')

    def __str__(self):
        return self.name