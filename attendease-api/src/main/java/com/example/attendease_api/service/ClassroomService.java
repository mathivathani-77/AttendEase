package com.example.attendease_api.service;

import com.example.attendease_api.model.Classroom;
import com.example.attendease_api.model.Student;
import java.util.List;

public interface ClassroomService {
    Classroom createClassroom(Classroom classroom);
    List<Classroom> getAllClassrooms();
    Student addStudent(Student student);
    List<Student> getStudentsByClassroom(Long classroomId);
}
